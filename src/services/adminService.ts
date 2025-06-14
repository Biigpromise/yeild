import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminDashboardStats {
  totalUsers: number;
  activeTasks: number;
  pendingSubmissions: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  approvalRate: number;
}

export interface AdminUser {
  id: string;
  created_at: string;
  email: string;
  name: string;
  level: number;
  points: number;
  tasks_completed: number;
  user_roles: Array<{ role: string }>;
}

export const adminService = {
  // Verify admin access before any operations
  async verifyAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        console.error('Error verifying admin access:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error verifying admin access:', error);
      return false;
    }
  },

  // Get dashboard statistics with admin verification
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      throw new Error('Admin access required');
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation: 'get_dashboard_stats' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get all users with admin verification
  async getAllUsers(): Promise<AdminUser[]> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      throw new Error('Admin access required');
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation: 'get_all_users' }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user status with admin verification
  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_user_status',
          data: { userId, status }
        }
      });

      if (error) throw error;
      toast.success('User status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  // Assign role with admin verification
  async assignUserRole(userId: string, role: string): Promise<boolean> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'assign_user_role',
          data: { userId, role }
        }
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

  // Add bulk update users method
  async bulkUpdateUsers(userIds: string[], action: string): Promise<boolean> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'bulk_update_users',
          data: { userIds, action }
        }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error with bulk update:', error);
      throw error;
    }
  },

  // Get system metrics with admin verification
  async getSystemMetrics(): Promise<any> {
    const hasAccess = await this.verifyAdminAccess();
    if (!hasAccess) {
      throw new Error('Admin access required');
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { operation: 'get_system_metrics' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      throw error;
    }
  }
};
