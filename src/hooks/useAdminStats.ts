import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  activeTasks: number;
  engagementRate: number;
  totalRevenue: number;
  userGrowth: number;
  taskGrowth: number;
  engagementGrowth: number;
  revenueGrowth: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch active tasks
        const { count: activeTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch total submissions for engagement calculation
        const { count: totalSubmissions } = await supabase
          .from('task_submissions')
          .select('*', { count: 'exact', head: true });

        // Fetch approved submissions for engagement rate
        const { count: approvedSubmissions } = await supabase
          .from('task_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // Fetch revenue data
        const { data: revenueData } = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('status', 'successful');

        const totalRevenue = revenueData?.reduce((sum, transaction) => 
          sum + Number(transaction.amount), 0) || 0;

        // Calculate engagement rate
        const engagementRate = totalSubmissions && totalSubmissions > 0 
          ? Math.round((approvedSubmissions || 0) / totalSubmissions * 100)
          : 0;

        // Get data from last month for growth calculations
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const { count: lastMonthUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', lastMonth.toISOString());

        const { count: lastMonthTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', lastMonth.toISOString());

        // Calculate growth percentages
        const userGrowth = lastMonthUsers && lastMonthUsers > 0
          ? Math.round(((totalUsers || 0) - lastMonthUsers) / lastMonthUsers * 100)
          : 0;

        const taskGrowth = lastMonthTasks && lastMonthTasks > 0
          ? Math.round(((activeTasks || 0) - lastMonthTasks) / lastMonthTasks * 100)
          : 0;

        setStats({
          totalUsers: totalUsers || 0,
          activeTasks: activeTasks || 0,
          engagementRate,
          totalRevenue,
          userGrowth,
          taskGrowth,
          engagementGrowth: 2, // Placeholder for now
          revenueGrowth: 18 // Placeholder for now
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};