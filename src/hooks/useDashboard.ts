
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load profile data');
      } else if (profile) {
        setUserProfile(profile);
        setUserStats({
          points: profile.points || 0,
          level: profile.level || 1,
          tasksCompleted: profile.tasks_completed || 0,
          currentStreak: 0, // Default value since property doesn't exist
          rank: 0, // Default value since property doesn't exist
          referrals: profile.active_referrals_count || 0,
          followers: profile.followers_count || 0,
          following: profile.following_count || 0,
        });
        setTotalPointsEarned(profile.points || 0);
      }

      // Load tasks and submissions
      try {
        const [tasksData, submissionsData] = await Promise.all([
          taskService.getUserTasks().catch(() => []),
          taskService.getUserSubmissions().catch(() => [])
        ]);
        
        setUserTasks(tasksData || []);
        setUserSubmissions(submissionsData || []);
        
        // Filter completed tasks
        const completed = (submissionsData || []).filter((sub: any) => sub.status === 'approved');
        setCompletedTasks(completed);
      } catch (taskError) {
        console.error('Error loading tasks:', taskError);
        setError('Failed to load tasks data');
      }

      // Load withdrawal data
      try {
        const { data: withdrawals, error: withdrawalError } = await supabase
          .from('withdrawal_requests')
          .select('amount, status')
          .eq('user_id', user.id);

        if (withdrawalError) {
          console.error('Error loading withdrawals:', withdrawalError);
        } else if (withdrawals) {
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
        console.error('Error loading withdrawal data:', withdrawalError);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load dashboard data');
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
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loading,
    error,
    loadUserData
  };
};
