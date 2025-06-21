import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ReferralBirdLevel {
  name: string;
  icon: string;
  description: string;
  minReferrals: number;
  minPoints: number;
  color: string;
}

// Updated bird levels to match the design reference
export const BIRD_LEVELS: ReferralBirdLevel[] = [
  {
    name: 'None',
    minReferrals: 0,
    minPoints: 0,
    icon: 'none',
    description: 'No referral level yet',
    color: '#gray'
  },
  {
    name: 'Dove',
    minReferrals: 5,
    minPoints: 0,
    icon: 'dove',
    description: 'New Flight - 5+ referrals',
    color: '#d1d5db'
  },
  {
    name: 'Hawk',
    minReferrals: 20,
    minPoints: 0,
    icon: 'hawk',
    description: 'Rising Wing - 20+ referrals',
    color: '#f59e0b'
  },
  {
    name: 'Eagle',
    minReferrals: 100,
    minPoints: 0,
    icon: 'eagle',
    description: 'Trailblazer - 100+ referrals',
    color: '#3b82f6'
  },
  {
    name: 'Falcon',
    minReferrals: 500,
    minPoints: 0,
    icon: 'falcon',
    description: 'Sky Master - 500+ referrals',
    color: '#8b5cf6'
  },
  {
    name: 'Phoenix',
    minReferrals: 1000,
    minPoints: 0,
    icon: 'phoenix',
    description: 'Legend of YEILD - 1000+ referrals',
    color: '#f97316'
  }
];

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  reward_points: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  points_earned?: number;
  task?: Task;
}

export interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  submission_url: string;
  submitted_at: string;
  status: string;
  feedback?: string;
  points_awarded?: number;
  task?: Task;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  is_active: boolean;
  created_at: string;
  activated_at?: string;
  points_awarded: number;
  referred_user?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
}

export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  pending_referrals: number;
  bird_level: ReferralBirdLevel;
  next_bird_level?: ReferralBirdLevel;
  referrals_to_next: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  rank: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_picture_url?: string;
  points: number;
  level: number;
  tasks_completed: number;
  followers_count: number;
  following_count: number;
  created_at: string;
}

// Fixed UserStats interface to include longestStreak
export interface UserStats {
  total_points: number;
  tasks_completed: number;
  tasksCompleted: number; // Added for backward compatibility
  current_level: number;
  level: number; // Added for components that expect this
  points: number; // Added for components that expect this
  currentStreak: number; // Added for Profile.tsx compatibility
  longestStreak: number; // Added for Profile.tsx compatibility
  referrals_made: number;
  achievements_earned: number;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  user?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
}

export interface PostReply {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
}

export const userService = {
  getBirdLevel(activeReferrals: number, userPoints: number = 0): ReferralBirdLevel {
    // Find the highest level the user qualifies for
    for (let i = BIRD_LEVELS.length - 1; i >= 0; i--) {
      const level = BIRD_LEVELS[i];
      if (activeReferrals >= level.minReferrals && userPoints >= level.minPoints) {
        return level;
      }
    }
    return BIRD_LEVELS[0]; // Return first level as default
  },

  getNextBirdLevel(currentBirdLevel: ReferralBirdLevel): ReferralBirdLevel | undefined {
    const currentIndex = BIRD_LEVELS.findIndex(level => level.name === currentBirdLevel.name);
    return currentIndex < BIRD_LEVELS.length - 1 ? BIRD_LEVELS[currentIndex + 1] : undefined;
  },

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's profile for points
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      const userPoints = profile?.points || 0;

      // Get referral data
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('is_active')
        .eq('referrer_id', user.id);

      if (error) throw error;

      const totalReferrals = referrals?.length || 0;
      const activeReferrals = referrals?.filter(r => r.is_active).length || 0;
      const pendingReferrals = totalReferrals - activeReferrals;

      const birdLevel = this.getBirdLevel(activeReferrals, userPoints);
      
      // Find next bird level
      const currentIndex = BIRD_LEVELS.findIndex(level => level.name === birdLevel.name);
      const nextBirdLevel = currentIndex < BIRD_LEVELS.length - 1 ? BIRD_LEVELS[currentIndex + 1] : undefined;
      
      const referralsToNext = nextBirdLevel 
        ? Math.max(0, nextBirdLevel.minReferrals - activeReferrals)
        : 0;

      return {
        total_referrals: totalReferrals,
        active_referrals: activeReferrals,
        pending_referrals: pendingReferrals,
        bird_level: birdLevel,
        next_bird_level: nextBirdLevel,
        referrals_to_next: referralsToNext
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        total_referrals: 0,
        active_referrals: 0,
        pending_referrals: 0,
        bird_level: BIRD_LEVELS[0],
        next_bird_level: BIRD_LEVELS[1],
        referrals_to_next: BIRD_LEVELS[1].minReferrals
      };
    }
  },

  async getUserReferralCode(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      return profile?.referral_code || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  },

  async getUserReferrals(): Promise<UserReferral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Simplified query to avoid foreign key issues
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get referred user details separately
      const transformedReferrals = await Promise.all(
        (referrals || []).map(async (referral) => {
          let referredUser = undefined;
          
          // Fetch referred user profile separately
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, profile_picture_url')
            .eq('id', referral.referred_id)
            .single();
            
          if (profile) {
            referredUser = {
              id: profile.id,
              name: profile.name,
              profile_picture_url: profile.profile_picture_url
            };
          }
          
          return {
            id: referral.id,
            referrer_id: referral.referrer_id,
            referred_id: referral.referred_id,
            referral_code: referral.referral_code,
            is_active: referral.is_active,
            created_at: referral.created_at,
            activated_at: referral.activated_at,
            points_awarded: referral.points_awarded,
            referred_user: referredUser
          };
        })
      );
      
      return transformedReferrals;
    } catch (error) {
      console.error('Error getting user referrals:', error);
      return [];
    }
  },

  async getLeaderboard(): Promise<LeaderboardUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, points, level, tasks_completed')
        .order('points', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  async updateProfile(updates: {name?: string, bio?: string, profile_picture_url?: string}): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  },

  async getUserTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_tasks')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return [];
    }
  },

  async getUserSubmissions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          task:tasks(*)
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user submissions:', error);
      return [];
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          active_referrals_count,
          total_referrals_count
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  async searchUsers(query: string, limit: number = 10): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  async getUserStats(): Promise<UserStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('points, level, tasks_completed')
        .eq('id', user.id)
        .single();

      const { data: referrals } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', user.id);

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id);

      // Get current streak from user_streaks table
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .eq('streak_type', 'task_completion')
        .single();

      const stats = {
        total_points: profile?.points || 0,
        tasks_completed: profile?.tasks_completed || 0,
        tasksCompleted: profile?.tasks_completed || 0, // For backward compatibility
        current_level: profile?.level || 1,
        level: profile?.level || 1, // For components that expect this
        points: profile?.points || 0, // For components that expect this
        currentStreak: streakData?.current_streak || 0, // Added for Profile.tsx compatibility
        longestStreak: streakData?.longest_streak || 0, // Added for Profile.tsx compatibility
        referrals_made: referrals?.length || 0,
        achievements_earned: achievements?.length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  },

  async getPointTransactions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting point transactions:', error);
      return [];
    }
  },

  async isFollowing(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  async followUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_followers')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  async unfollowUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  async handleReferralSignup(referralCode: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call the database function to handle referral signup
      const { error } = await supabase.rpc('handle_referral_signup', {
        new_user_id: user.id,
        referral_code_param: referralCode
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error handling referral signup:', error);
    }
  },

  async getStories(): Promise<Story[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_url,
          media_type,
          caption,
          created_at,
          expires_at,
          view_count,
          profiles!stories_user_id_fkey (
            id,
            name,
            profile_picture_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedStories = (data || []).map(story => ({
        id: story.id,
        user_id: story.user_id,
        media_url: story.media_url,
        media_type: story.media_type,
        caption: story.caption,
        created_at: story.created_at,
        expires_at: story.expires_at,
        view_count: story.view_count,
        user: story.profiles ? {
          id: story.profiles.id,
          name: story.profiles.name,
          profile_picture_url: story.profiles.profile_picture_url
        } : undefined
      }));
      
      return transformedStories;
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  },

  async createStory(mediaUrl: string, mediaType: string, caption?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption: caption
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating story:', error);
      return false;
    }
  },

  async trackStoryView(storyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: user.id
        });
    } catch (error) {
      // Ignore duplicate view errors
      if (!error.message?.includes('duplicate')) {
        console.error('Error tracking story view:', error);
      }
    }
  },

  async getPostReplies(postId: string): Promise<PostReply[]> {
    try {
      const { data, error } = await supabase
        .from('post_replies')
        .select(`
          *,
          profiles(id, name, profile_picture_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting post replies:', error);
      return [];
    }
  },

  async addPostReply(postId: string, content: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding post reply:', error);
      return false;
    }
  }
};
