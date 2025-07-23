
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
      
      console.log('Loading user data for:', user.id);
      
      // Load profile data with comprehensive error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load profile data');
        return;
      }

      if (!profile) {
        console.log('No profile found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.email?.split('@')[0] || 'User',
            points: 0,
            level: 1,
            tasks_completed: 0,
            active_referrals_count: 0,
            total_referrals_count: 0,
            followers_count: 0,
            following_count: 0
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          setError('Failed to create user profile');
          return;
        }
        
        setUserProfile(newProfile);
        setUserStats({
          points: 0,
          level: 1,
          tasksCompleted: 0,
          currentStreak: 0,
          rank: 0,
          referrals: 0,
          followers: 0,
          following: 0
        });
        setTotalPointsEarned(0);
      } else {
        console.log('Profile loaded:', profile);
        setUserProfile(profile);
        setUserStats({
          points: profile.points || 0,
          level: profile.level || 1,
          tasksCompleted: profile.tasks_completed || 0,
          currentStreak: 0,
          rank: 0,
          referrals: profile.active_referrals_count || 0,
          followers: profile.followers_count || 0,
          following: profile.following_count || 0,
        });
        setTotalPointsEarned(profile.points || 0);
      }

      // Load user tasks and submissions
      try {
        console.log('Loading user tasks...');
        const { data: userTasksData, error: tasksError } = await supabase
          .from('user_tasks')
          .select(`
            *,
            tasks (
              id,
              title,
              description,
              points,
              category,
              difficulty
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error('Error loading user tasks:', tasksError);
        } else {
          console.log('User tasks loaded:', userTasksData);
          setUserTasks(userTasksData || []);
        }

        console.log('Loading user submissions...');
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks (
              id,
              title,
              description,
              points,
              category,
              difficulty
            )
          `)
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false });

        if (submissionsError) {
          console.error('Error loading user submissions:', submissionsError);
        } else {
          console.log('User submissions loaded:', submissionsData);
          setUserSubmissions(submissionsData || []);
          
          // Filter approved submissions as completed tasks
          const approvedSubmissions = (submissionsData || []).filter(
            (sub: any) => sub.status === 'approved'
          );
          setCompletedTasks(approvedSubmissions);
        }
      } catch (taskError) {
        console.error('Error loading task data:', taskError);
      }

      // Load withdrawal data
      try {
        console.log('Loading withdrawal data...');
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
