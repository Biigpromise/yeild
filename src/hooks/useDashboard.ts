
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/services/taskService';

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 1,
    tasksCompleted: 0,
    referrals: 0
  });
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserStats({
        points: profile?.points || 0,
        level: profile?.level || 1,
        tasksCompleted: profile?.tasks_completed || 0,
        referrals: profile?.active_referrals_count || 0
      });

      // Fetch user's recent tasks
      const userTasksData = await taskService.getUserTasks();
      setUserTasks(userTasksData);

      // Fetch recent point transactions for activity feed
      const { data: transactions, error: transError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!transError && transactions) {
        setRecentActivity(transactions);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    loading,
    userStats,
    userTasks,
    recentActivity,
    refreshData
  };
};
