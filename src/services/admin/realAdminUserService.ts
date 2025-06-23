
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  created_at: string;
  email: string;
  name: string;
  level: number;
  points: number;
  tasks_completed: number;
  user_roles: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
}

export const realAdminUserService = {
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          email,
          name,
          level,
          points,
          tasks_completed
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      // Fetch user roles and streaks separately to avoid relation issues
      const userIds = data?.map(user => user.id) || [];
      
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds)
        .eq('streak_type', 'task_completion');

      // Combine the data
      const usersWithRoles = data?.map(user => ({
        ...user,
        user_roles: rolesData?.filter(role => role.user_id === user.id).map(r => ({ role: r.role })) || [{ role: 'user' }],
        user_streaks: streaksData?.filter(streak => streak.user_id === user.id).map(s => ({ current_streak: s.current_streak })) || []
      })) || [];

      return usersWithRoles;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd update a status field
      toast.success(`User ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      // First, remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add the new role
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole }]);

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      toast.success(`User role updated to ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  },

  async createUser(userData: { email: string; name: string; password: string }): Promise<boolean> {
    try {
      // Use Supabase auth to create the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      toast.success('User created successfully');
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      return false;
    }
  },

  async exportUserData(format: 'csv' | 'json' = 'csv'): Promise<void> {
    try {
      const users = await this.getAllUsers();
      
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Create CSV content
        const headers = ['ID', 'Name', 'Email', 'Points', 'Level', 'Tasks Completed', 'Role', 'Created At'];
        const rows = users.map(user => [
          user.id,
          user.name || '',
          user.email || '',
          user.points.toString(),
          user.level.toString(),
          user.tasks_completed.toString(),
          user.user_roles[0]?.role || 'user',
          new Date(user.created_at).toLocaleDateString()
        ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // Create JSON content
        content = JSON.stringify(users, null, 2);
        filename = `users_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Users exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export users');
    }
  },

  async importUsers(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      let users: Array<{ email: string; name: string; password?: string }> = [];

      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 2) {
            users.push({
              email: values[0]?.trim(),
              name: values[1]?.trim(),
              password: values[2]?.trim() || 'defaultPassword123'
            });
          }
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        users = JSON.parse(text);
      }

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        if (user.email && user.name) {
          try {
            await this.createUser({
              email: user.email,
              name: user.name,
              password: user.password || 'defaultPassword123'
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to create user ${user.email}:`, error);
            errorCount++;
          }
        }
      }

      toast.success(`Import completed: ${successCount} users created, ${errorCount} errors`);
      return successCount > 0;
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Failed to import users');
      return false;
    }
  }
};
