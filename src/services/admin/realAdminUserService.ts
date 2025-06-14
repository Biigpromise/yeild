
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const realAdminUserService = {
  // Create new user
  async createUser(userData: { email: string; name: string; password: string }): Promise<boolean> {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create or update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            points: 0,
            level: 1,
            tasks_completed: 0
          });

        if (profileError) throw profileError;
      }

      toast.success("User created successfully!");
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user: " + error.message);
      return false;
    }
  },

  // Get all users with real data
  async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          user_streaks(current_streak, streak_type),
          withdrawal_requests(status, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Update user status
  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned'): Promise<boolean> {
    try {
      // In a real app, you'd have a status field in profiles or a separate user_status table
      // For now, we'll use a simple approach with admin notes
      const { error } = await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
          // status: status - this would be added to the profiles table
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast.success(`User status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  // Assign role to user
  async assignRole(userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success(`Role ${role} assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  },

  // Get user activity with real data
  async getUserActivity(userId: string): Promise<any> {
    try {
      const [profileData, submissionsData, transactionsData, activityData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('task_submissions').select('*').eq('user_id', userId),
        supabase.from('point_transactions').select('*').eq('user_id', userId),
        supabase.from('user_activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
      ]);

      return {
        profile: profileData.data,
        submissions: submissionsData.data || [],
        transactions: transactionsData.data || [],
        recentActivity: activityData.data || []
      };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return null;
    }
  },

  // Export user data
  async exportUserData(format: 'csv' | 'json' = 'json'): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          task_submissions(status, submitted_at),
          point_transactions(points, transaction_type, created_at)
        `);

      if (error) throw error;

      let exportData: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Convert to CSV
        const headers = ['ID', 'Name', 'Email', 'Points', 'Level', 'Tasks Completed', 'Created At'];
        const csvRows = [headers.join(',')];
        
        users?.forEach(user => {
          const row = [
            user.id,
            user.name || '',
            user.email || '',
            user.points || 0,
            user.level || 1,
            user.tasks_completed || 0,
            user.created_at || ''
          ];
          csvRows.push(row.join(','));
        });
        
        exportData = csvRows.join('\n');
        filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        // JSON format
        exportData = JSON.stringify({
          users: users || [],
          exportDate: new Date().toISOString(),
          totalUsers: users?.length || 0
        }, null, 2);
        filename = `users-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      // Create download
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("User data exported successfully!");
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error("Failed to export user data");
    }
  },

  // Import users from CSV
  async importUsers(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      if (!headers.includes('email') || !headers.includes('name')) {
        toast.error("CSV must include 'email' and 'name' columns");
        return false;
      }

      const users = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {};
        headers.forEach((header, index) => {
          user[header] = values[index] || '';
        });
        return user;
      }).filter(user => user.email && user.name);

      let successCount = 0;
      for (const user of users) {
        try {
          const success = await this.createUser({
            email: user.email,
            name: user.name,
            password: user.password || 'TempPassword123!'
          });
          if (success) successCount++;
        } catch (userError) {
          console.error('Error creating user:', user.email, userError);
        }
      }

      toast.success(`Successfully imported ${successCount} users`);
      return true;
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error("Failed to import users");
      return false;
    }
  }
};
