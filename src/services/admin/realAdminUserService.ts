import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  user_roles?: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
}

export const realAdminUserService = {
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('Fetching all users from database...');
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          points,
          level,
          tasks_completed,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        return [];
      }

      // Get user IDs to fetch roles and streaks
      const userIds = profiles.map(p => p.id);

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Fetch user streaks
      const { data: streaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      if (streaksError) {
        console.error('Error fetching user streaks:', streaksError);
      }

      // Combine the data
      const users: AdminUser[] = profiles.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || [],
        user_streaks: streaks?.filter(s => s.user_id === profile.id).map(s => ({ current_streak: s.current_streak })) || []
      }));

      console.log('Users fetched successfully:', users.length);
      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async createUser(userData: { email: string; name: string; password: string }): Promise<boolean> {
    try {
      console.log('Creating new user:', userData.email);

      // Create user using Supabase Auth Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          name: userData.name
        },
        email_confirm: true
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error('Failed to create user: ' + error.message);
        return false;
      }

      if (data.user) {
        // Create profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            points: 0,
            level: 1,
            tasks_completed: 0
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast.error('User created but profile setup failed');
          return false;
        }

        toast.success('User created successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in createUser:', error);
      toast.error('Failed to create user');
      return false;
    }
  },

  async exportUserData(format: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      console.log('Exporting user data in format:', format);
      
      const users = await this.getAllUsers();
      
      if (users.length === 0) {
        toast.error('No users to export');
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Convert to CSV
        const headers = ['ID', 'Name', 'Email', 'Points', 'Level', 'Tasks Completed', 'Created At', 'Roles', 'Current Streak'];
        const csvData = users.map(user => [
          user.id,
          user.name || '',
          user.email || '',
          user.points,
          user.level,
          user.tasks_completed,
          user.created_at,
          user.user_roles?.map(r => r.role).join(';') || '',
          user.user_streaks?.[0]?.current_streak || 0
        ]);

        content = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON format
        content = JSON.stringify(users, null, 2);
        filename = `users_export_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`User data exported successfully (${users.length} users)`);
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Failed to export user data');
    }
  },

  async importUsers(file: File): Promise<boolean> {
    try {
      console.log('Importing users from file:', file.name);

      const text = await file.text();
      let users: Array<{ email: string; name: string; password?: string }>;

      if (file.name.endsWith('.json')) {
        users = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        users = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const user: any = {};
            headers.forEach((header, index) => {
              user[header.toLowerCase()] = values[index] || '';
            });
            return user;
          });
      } else {
        toast.error('Unsupported file format. Please use JSON or CSV.');
        return false;
      }

      if (!Array.isArray(users) || users.length === 0) {
        toast.error('No valid user data found in file');
        return false;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const userData of users) {
        if (!userData.email || !userData.name) {
          errorCount++;
          continue;
        }

        const success = await this.createUser({
          email: userData.email,
          name: userData.name,
          password: userData.password || Math.random().toString(36).slice(-8) + 'A1!'
        });

        if (success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Import completed: ${successCount} users created, ${errorCount} failed`);
      return successCount > 0;
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Failed to import users');
      return false;
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    try {
      console.log('Updating user status:', userId, status);

      // We can't directly update auth.users, but we can manage through user_roles
      // For suspension, we could add a suspended role or handle it differently
      if (status === 'suspended') {
        // Add suspended role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'suspended'
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error suspending user:', error);
          return false;
        }
      } else {
        // Remove suspended role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'suspended');

        if (error) {
          console.error('Error activating user:', error);
          return false;
        }
      }

      toast.success(`User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      console.log('Updating user role:', userId, newRole);

      // First remove existing roles (except suspended)
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .neq('role', 'suspended');

      // Add new role if not 'user' (default)
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole
          });

        if (error) {
          console.error('Error updating user role:', error);
          return false;
        }
      }

      toast.success(`User role updated to ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  }
};
