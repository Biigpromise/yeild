
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

export const adminService = {
  // Get all users for admin management
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    }
  },

  // Assign role to user
  async assignUserRole(userId: string, role: string): Promise<boolean> {
    try {
      // First remove any existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Then add the new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  },

  // Bulk update users
  async bulkUpdateUsers(userIds: string[], action: string): Promise<boolean> {
    try {
      // This is a placeholder - implement based on what actions you want to support
      console.log('Bulk action:', action, 'for users:', userIds);
      return true;
    } catch (error) {
      console.error('Error with bulk action:', error);
      return false;
    }
  },

  // Get platform statistics
  async getPlatformStats(): Promise<any> {
    try {
      const [usersCount, tasksCount, submissionsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('task_submissions').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: usersCount.count || 0,
        totalTasks: tasksCount.count || 0,
        totalSubmissions: submissionsCount.count || 0
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        totalTasks: 0,
        totalSubmissions: 0
      };
    }
  }
};
