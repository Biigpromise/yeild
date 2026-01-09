
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    points: 0,
    credits: 0,
    level: 1,
    tasksCompleted: 0,
    executionOrdersCompleted: 0,
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

  const loadUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading user data for:', user.id);
      
      // Load all data in parallel for faster loading
      const [profileResult, tasksResult, submissionsResult, withdrawalsResult] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_tasks').select(`
          *,
          tasks (
            id,
            title,
            description,
            points,
            category,
            difficulty
          )
        `).eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('task_submissions').select(`
          *,
          tasks (
            id,
            title,
            description,
            points,
            category,
            difficulty
          )
        `).eq('user_id', user.id).order('submitted_at', { ascending: false }),
        supabase.from('withdrawal_requests').select('amount, status').eq('user_id', user.id)
      ]);

      // Handle profile data
      if (profileResult.status === 'fulfilled' && !profileResult.value.error) {
        const profile = profileResult.value.data;
        if (profile) {
          setUserProfile(profile);
          setUserStats({
            points: profile.points || 0,
            credits: profile.points || 0,
            level: profile.level || 1,
            tasksCompleted: profile.tasks_completed || 0,
            executionOrdersCompleted: profile.tasks_completed || 0,
            currentStreak: 0,
            rank: 0,
            referrals: profile.active_referrals_count || 0,
            followers: profile.followers_count || 0,
            following: profile.following_count || 0,
          });
          setTotalPointsEarned(profile.points || 0);
        } else {
          // Profile doesn't exist, create one
          console.log('No profile found, creating default profile...');
          await createDefaultProfile();
        }
      } else if (profileResult.status === 'fulfilled' && !profileResult.value.data) {
        // No profile found, create one
        console.log('No profile found, creating default profile...');
        await createDefaultProfile();
      } else if (profileResult.status === 'rejected' || (profileResult.status === 'fulfilled' && profileResult.value.error)) {
        const errorMsg = profileResult.status === 'rejected' ? 
          profileResult.reason?.message || 'Network error' : 
          profileResult.value.error?.message || 'Database error';
        console.error('Profile query failed:', errorMsg);
        setError(`Failed to load profile data: ${errorMsg}`);
        toast.error('Failed to load profile data. Please try refreshing the page.');
      }

      // Handle tasks data
      if (tasksResult.status === 'fulfilled' && !tasksResult.value.error) {
        setUserTasks(tasksResult.value.data || []);
      }

      // Handle submissions data
      if (submissionsResult.status === 'fulfilled' && !submissionsResult.value.error) {
        const submissions = submissionsResult.value.data || [];
        setUserSubmissions(submissions);
        const approved = submissions.filter((sub: any) => sub.status === 'approved');
        setCompletedTasks(approved);
      }

      // Handle withdrawals data
      if (withdrawalsResult.status === 'fulfilled' && !withdrawalsResult.value.error) {
        const withdrawals = withdrawalsResult.value.data || [];
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
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createDefaultProfile = async () => {
    if (!user) return;
    
    try {
      // First try to insert the profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          points: 0,
          level: 1,
          tasks_completed: 0,
          active_referrals_count: 0,
          total_referrals_count: 0,
          followers_count: 0,
          following_count: 0,
          can_post_in_chat: false,
          task_completion_rate: 0.0
        });

      // If insert succeeded or failed with duplicate, fetch the profile
      if (!insertError || insertError.code === '23505') {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (existingProfile && !fetchError) {
          console.log('Profile created/found successfully:', existingProfile);
          setUserProfile(existingProfile);
          setUserStats({
            points: existingProfile.points || 0,
            credits: existingProfile.points || 0,
            level: existingProfile.level || 1,
            tasksCompleted: existingProfile.tasks_completed || 0,
            executionOrdersCompleted: existingProfile.tasks_completed || 0,
            currentStreak: 0,
            rank: 0,
            referrals: existingProfile.active_referrals_count || 0,
            followers: existingProfile.followers_count || 0,
            following: existingProfile.following_count || 0,
          });
          setTotalPointsEarned(existingProfile.points || 0);
          setError(null);
        }
      } else {
        console.error('Failed to create profile:', insertError);
      }
    } catch (createError) {
      console.error('Exception creating profile:', createError);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);
  
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
