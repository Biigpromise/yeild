
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

export interface AdminDashboardStats {
  totalUsers: number;
  activeTasks: number;
  pendingSubmissions: number;
  approvalRate: number;
}

export const adminService = {
  // Get all users for admin management
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Group roles by user_id
      const userRolesMap: Record<string, Array<{ role: string }>> = {};
      if (!rolesError && userRoles) {
        userRoles.forEach(roleRecord => {
          if (!userRolesMap[roleRecord.user_id]) {
            userRolesMap[roleRecord.user_id] = [];
          }
          userRolesMap[roleRecord.user_id].push({ role: roleRecord.role });
        });
      }

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        user_roles: userRolesMap[profile.id] || [{ role: 'user' }]
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [usersCount, tasksCount, submissionsCount, approvedCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('task_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('task_submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved')
      ]);

      const totalSubmissions = submissionsCount.count || 0;
      const approvedSubmissions = approvedCount.count || 0;
      const approvalRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

      return {
        totalUsers: usersCount.count || 0,
        activeTasks: tasksCount.count || 0,
        pendingSubmissions: totalSubmissions,
        approvalRate
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalUsers: 0,
        activeTasks: 0,
        pendingSubmissions: 0,
        approvalRate: 0
      };
    }
  },

  // Assign role to user
  async assignUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

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
          role: role,
          assigned_by: user.id
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
