
import { supabase } from "@/integrations/supabase/client";

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
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  user_roles?: { role: string }[];
}

export interface SystemMetrics {
  recentSignups: number;
  recentTasks: number;
  recentSubmissions: number;
  totalPointsAwarded: number;
}

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'get_dashboard_stats' }
    });
    
    if (error) throw error;
    return data;
  },

  // Get all users for admin management
  async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'get_all_users' }
    });
    
    if (error) throw error;
    return data;
  },

  // Update user status
  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { 
        operation: 'update_user_status',
        data: { userId, status }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Assign role to user
  async assignUserRole(userId: string, role: string) {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { 
        operation: 'assign_user_role',
        data: { userId, role }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Get system metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { operation: 'get_system_metrics' }
    });
    
    if (error) throw error;
    return data;
  },

  // Bulk operations
  async bulkUpdateUsers(userIds: string[], operation: string) {
    const results = await Promise.all(
      userIds.map(userId => this.updateUserStatus(userId, operation))
    );
    return results;
  },

  // Analytics and reporting
  async getAnalyticsData(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks(title, points, category),
        profiles(name, email)
      `)
      .gte('submitted_at', startDate)
      .lte('submitted_at', endDate)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
