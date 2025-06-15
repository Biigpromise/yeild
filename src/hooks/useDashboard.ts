import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';

export const useDashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 1,
    tasksCompleted: 0,
    currentStreak: 0,
    rank: 0,
    referrals: 0,
    followers: 0,
    following: 0
  });
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [withdrawalStats, setWithdrawalStats] = useState({
    pendingWithdrawals: 0,
    completedWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }
      
      if (profile) {
          setUserProfile(profile);
          setUserStats(prev => ({
            ...prev,
            points: profile.points || 0,
            level: profile.level || 1,
            tasksCompleted: profile.tasks_completed || 0,
            followers: profile.followers_count || 0,
            following: profile.following_count || 0,
          }));
      }

      const [tasksData, submissionsData] = await Promise.all([
        taskService.getUserTasks(),
        taskService.getUserSubmissions()
      ]);
      
      setUserTasks(tasksData);
      setUserSubmissions(submissionsData);

      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawals) {
        const pending = withdrawals
          .filter(w => w.status === 'pending' || w.status === 'approved')
          .reduce((sum, w) => sum + w.amount, 0);
        const completed = withdrawals
          .filter(w => w.status === 'completed')
          .reduce((sum, w) => sum + w.amount, 0);
        
        setWithdrawalStats({
          pendingWithdrawals: pending,
          completedWithdrawals: completed
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);
  
  return {
    user,
    userProfile,
    userStats,
    userTasks,
    userSubmissions,
    withdrawalStats,
    loading,
    loadUserData
  };
};
