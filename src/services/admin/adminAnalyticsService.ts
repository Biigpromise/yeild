
import { supabase } from "@/integrations/supabase/client";

export interface AdminAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalPoints: number;
  totalWithdrawals: number;
  userGrowth: Array<{ date: string; users: number; }>;
  taskCompletion: Array<{ date: string; completed: number; }>;
  revenueData: Array<{ date: string; revenue: number; }>;
  userActivityData: Array<{ date: string; active: number; }>;
}

export const adminAnalyticsService = {
  async getAnalyticsData(): Promise<AdminAnalyticsData> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (logged in last 30 days)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get total tasks
      const { count: totalTasks } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      // Get completed tasks
      const { count: completedTasks } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get total points distributed
      const { data: pointsData } = await supabase
        .from('profiles')
        .select('points');
      
      const totalPoints = pointsData?.reduce((sum, profile) => sum + (profile.points || 0), 0) || 0;

      // Get total withdrawals
      const { data: withdrawalData } = await supabase
        .from('withdrawal_requests')
        .select('amount')
        .eq('status', 'completed');
      
      const totalWithdrawals = withdrawalData?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;

      // Get user growth data (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Process user growth data
      const userGrowth = this.processGrowthData(userGrowthData || [], 'created_at');

      // Get task completion data (last 30 days)
      const { data: taskCompletionData } = await supabase
        .from('task_submissions')
        .select('submitted_at')
        .eq('status', 'approved')
        .gte('submitted_at', thirtyDaysAgo.toISOString())
        .order('submitted_at', { ascending: true });

      const taskCompletion = this.processGrowthData(taskCompletionData || [], 'submitted_at');

      // Generate revenue data (mock for now - would need payment integration)
      const revenueData = this.generateMockRevenueData();

      // Get user activity data
      const { data: activityData } = await supabase
        .from('profiles')
        .select('last_active_at')
        .gte('last_active_at', thirtyDaysAgo.toISOString());

      const userActivityData = this.processGrowthData(activityData || [], 'last_active_at');

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTasks: totalTasks || 0,
        completedTasks: completedTasks || 0,
        totalPoints,
        totalWithdrawals,
        userGrowth,
        taskCompletion,
        revenueData,
        userActivityData
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Return default data on error
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        totalWithdrawals: 0,
        userGrowth: [],
        taskCompletion: [],
        revenueData: [],
        userActivityData: []
      };
    }
  },

  processGrowthData(data: any[], dateField: string) {
    const dailyCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        [dateField === 'created_at' ? 'users' : dateField === 'submitted_at' ? 'completed' : 'active']: dailyCounts[dateStr] || 0
      });
    }

    return result;
  },

  generateMockRevenueData() {
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        revenue: Math.floor(Math.random() * 1000) + 200 // Mock revenue data
      });
    }
    return result;
  }
};
