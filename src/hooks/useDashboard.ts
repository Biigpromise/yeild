
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
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [withdrawalStats, setWithdrawalStats] = useState({
    pendingWithdrawals: 0,
    completedWithdrawals: 0
  });
  const [loading, setLoading] = useState(false);

  const loadUserData = async () => {
    if (!user) {
        return;
    }
    
    try {
      
      // Load profile data with better error handling
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        } else if (profile) {
          setUserProfile(profile);
          setUserStats(prev => ({
            ...prev,
            points: profile.points || 0,
            level: profile.level || 1,
            tasksCompleted: profile.tasks_completed || 0,
            followers: profile.followers_count || 0,
            following: profile.following_count || 0,
          }));
          setTotalPointsEarned(profile.points || 0);
        }
      } catch (profileError) {
        console.error('Profile fetch exception:', profileError);
      }

      // Load tasks and submissions with better error handling
      try {
        const [tasksData, submissionsData] = await Promise.allSettled([
          taskService.getUserTasks(),
          taskService.getUserSubmissions()
        ]);
        
        if (tasksData.status === 'fulfilled') {
          setUserTasks(tasksData.value || []);
        } else {
          console.error('Failed to load user tasks:', tasksData.reason);
          setUserTasks([]);
        }

        if (submissionsData.status === 'fulfilled') {
          setUserSubmissions(submissionsData.value || []);
          // Filter completed tasks from submissions
          const completed = (submissionsData.value || []).filter((sub: any) => sub.status === 'approved');
          setCompletedTasks(completed);
        } else {
          console.error('Failed to load user submissions:', submissionsData.reason);
          setUserSubmissions([]);
          setCompletedTasks([]);
        }
      } catch (taskError) {
        console.error('Tasks fetch exception:', taskError);
        setUserTasks([]);
        setUserSubmissions([]);
        setCompletedTasks([]);
      }

      // Load withdrawal data with better error handling
      try {
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
      } catch (withdrawalError) {
        console.error('Withdrawal fetch exception:', withdrawalError);
        setWithdrawalStats({
          pendingWithdrawals: 0,
          completedWithdrawals: 0
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      // Don't show toast error as it might be a temporary issue
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  return {
    user,
    userProfile,
    userStats,
    userTasks,
    userSubmissions,
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loading,
    loadUserData
  };
};
