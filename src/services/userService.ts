import { supabase } from "@/integrations/supabase/client";

export interface ReferralBirdLevel {
  id: number;
  name: string;
  icon: string;
  minReferrals: number;
  minPoints: number;
  description: string;
  color: string;
  benefits: string[];
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  profile_picture_url?: string;
  level?: number;
  points?: number;
  tasks_completed?: number;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
  active_referrals_count?: number;
  total_referrals_count?: number;
}

export interface UserStats {
  level: number;
  points: number;
  tasksCompleted: number;
  tasks_completed: number;
  currentStreak: number;
  longestStreak: number;
  referrals_made?: number;
  achievements_earned?: number;
}

export interface UserReferral {
  id: string;
  referred_id: string;
  referrer_id: string;
  referral_code: string;
  points_awarded: number;
  is_active: boolean;
  created_at: string;
  activated_at?: string;
  referred_user?: UserProfile;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pointsEarned: number;
  conversionRate: number;
  total_referrals: number;
  active_referrals: number;
  bird_level?: ReferralBirdLevel;
  next_bird_level?: ReferralBirdLevel;
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
  profiles?: UserProfile;
  user?: UserProfile;
}

export const BIRD_LEVELS: ReferralBirdLevel[] = [
  {
    id: 0,
    name: 'Beginner',
    icon: 'dove',
    minReferrals: 0,
    minPoints: 0,
    description: 'Welcome to the community! Start your journey here.',
    color: '#9CA3AF',
    benefits: ['Basic profile features', 'Community access']
  },
  {
    id: 1,
    name: 'Scout',
    icon: 'dove',
    minReferrals: 1,
    minPoints: 100,
    description: 'Your first referral! Keep building your network.',
    color: '#10B981',
    benefits: ['Basic profile features', 'Community access']
  },
  {
    id: 2,
    name: 'Networker',
    icon: 'hawk',
    minReferrals: 5,
    minPoints: 500,
    description: 'Strong networking skills! You\'re building a community.',
    color: '#3B82F6',
    benefits: ['Premium task access', 'Priority support']
  },
  {
    id: 3,
    name: 'Influencer',
    icon: 'eagle',
    minReferrals: 15,
    minPoints: 1500,
    description: 'Your influence is growing! People trust your recommendations.',
    color: '#8B5CF6',
    benefits: ['Leaderboard visibility', 'Special badges', 'Enhanced profile']
  },
  {
    id: 4,
    name: 'Leader',
    icon: 'falcon',
    minReferrals: 30,
    minPoints: 3000,
    description: 'A true leader in the community! Your network is impressive.',
    color: '#F59E0B',
    benefits: ['Special rank', 'Early task access', 'VIP status']
  },
  {
    id: 5,
    name: 'Phoenix',
    icon: 'phoenix',
    minReferrals: 50,
    minPoints: 5000,
    description: 'Legendary status! You\'ve built an amazing community.',
    color: '#EF4444',
    benefits: ['Elite status', 'Exclusive rewards', 'Phoenix badge']
  }
];

export const userService = {
  getBirdLevel(activeReferrals: number, userPoints: number): ReferralBirdLevel {
    // Ensure we have valid numbers
    const referrals = Math.max(0, activeReferrals || 0);
    const points = Math.max(0, userPoints || 0);
    
    // Find the highest level the user qualifies for
    let qualifiedLevel = BIRD_LEVELS[0]; // Default to beginner
    
    for (const level of BIRD_LEVELS) {
      if (referrals >= level.minReferrals && points >= level.minPoints) {
        qualifiedLevel = level;
      } else {
        break; // Levels are ordered, so we can break here
      }
    }
    
    return qualifiedLevel;
  },

  getNextBirdLevel(currentLevel: ReferralBirdLevel): ReferralBirdLevel | undefined {
    const currentIndex = BIRD_LEVELS.findIndex(level => level.id === currentLevel.id);
    return currentIndex < BIRD_LEVELS.length - 1 ? BIRD_LEVELS[currentIndex + 1] : undefined;
  },

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  },

  async getUserProfileById(userId: string): Promise<Partial<UserProfile> | null> {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      if (!userId) {
        console.error('No user ID provided');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          bio,
          profile_picture_url,
          level,
          points,
          tasks_completed,
          followers_count,
          following_count,
          created_at,
          active_referrals_count,
          total_referrals_count
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile by ID:', error);
        return null;
      }

      if (!data) {
        console.log('No profile found for user ID:', userId);
        // Return a basic profile structure if no data found
        return {
          id: userId,
          name: 'User',
          followers_count: 0,
          following_count: 0,
          level: 1,
          points: 0,
          tasks_completed: 0
        };
      }

      console.log('Profile data loaded:', data);
      
      // Ensure we have a proper profile with default values
      return {
        ...data,
        name: data.name || 'User',
        followers_count: data.followers_count || 0,
        following_count: data.following_count || 0,
        level: data.level || 1,
        points: data.points || 0,
        tasks_completed: data.tasks_completed || 0
      };
    } catch (error) {
      console.error('Error in getUserProfileById:', error);
      return null;
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('level, points, tasks_completed, total_referrals_count, active_referrals_count')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Get current streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily')
        .single();

      // Get achievements count
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id);

      return {
        level: data?.level || 1,
        points: data?.points || 0,
        tasksCompleted: data?.tasks_completed || 0,
        tasks_completed: data?.tasks_completed || 0,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
        referrals_made: data?.total_referrals_count || 0,
        achievements_earned: achievementsData?.length || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        level: 1,
        points: 0,
        tasksCompleted: 0,
        tasks_completed: 0,
        currentStreak: 0,
        longestStreak: 0,
        referrals_made: 0,
        achievements_earned: 0
      };
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
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting point transactions:', error);
      return [];
    }
  },

  async searchUsers(query: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
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

      return !error && !!data;
    } catch (error) {
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

      // Update followers count for the user being followed
      const { data: followerProfile } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', userId)
        .single();

      if (followerProfile) {
        await supabase
          .from('profiles')
          .update({ followers_count: followerProfile.followers_count + 1 })
          .eq('id', userId);
      }

      // Update following count for the current user
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('following_count')
        .eq('id', user.id)
        .single();

      if (currentUserProfile) {
        await supabase
          .from('profiles')
          .update({ following_count: currentUserProfile.following_count + 1 })
          .eq('id', user.id);
      }

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

      // Update followers count using a safer approach
      const { data: profile } = await supabase
        .from('profiles')
        .select('followers_count')
        .eq('id', userId)
        .single();

      if (profile && profile.followers_count > 0) {
        await supabase
          .from('profiles')
          .update({ followers_count: profile.followers_count - 1 })
          .eq('id', userId);
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('following_count')
        .eq('id', user.id)
        .single();

      if (userProfile && userProfile.following_count > 0) {
        await supabase
          .from('profiles')
          .update({ following_count: userProfile.following_count - 1 })
          .eq('id', user.id);
      }

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  async getUserReferralCode(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data?.referral_code || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  },

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) throw error;

      const totalReferrals = data?.length || 0;
      const activeReferrals = data?.filter(r => r.is_active).length || 0;
      const pointsEarned = data?.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || 0;
      const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

      // Get user points for bird level calculation
      const { data: profileData } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      const userPoints = profileData?.points || 0;
      const currentBirdLevel = this.getBirdLevel(activeReferrals, userPoints);
      const nextBirdLevel = this.getNextBirdLevel(currentBirdLevel);

      return {
        totalReferrals,
        activeReferrals,
        pointsEarned,
        conversionRate,
        total_referrals: totalReferrals,
        active_referrals: activeReferrals,
        bird_level: currentBirdLevel,
        next_bird_level: nextBirdLevel
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        pointsEarned: 0,
        conversionRate: 0,
        total_referrals: 0,
        active_referrals: 0
      };
    }
  },

  async getUserReferrals(): Promise<UserReferral[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get referrals first
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Then get the referred user profiles separately
      const referralsWithUsers = await Promise.all(
        (referrals || []).map(async (referral) => {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', referral.referred_id)
            .single();

          return {
            ...referral,
            referred_user: userProfile
          };
        })
      );

      return referralsWithUsers;
    } catch (error) {
      console.error('Error getting user referrals:', error);
      return [];
    }
  },

  async handleReferralSignup(referralCode: string, newUserId: string): Promise<boolean> {
    try {
      // Find the referrer by referral code
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) return false;

      // Create referral record
      const { error: referralError } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: newUserId,
          referral_code: referralCode,
          is_active: true,
          activated_at: new Date().toISOString(),
          points_awarded: 100
        });

      if (referralError) throw referralError;

      // Award points to referrer using a safer approach
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', referrer.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: profile.points + 100 })
          .eq('id', referrer.id);
      }

      // Create point transaction record
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: referrer.id,
          points: 100,
          transaction_type: 'referral_bonus',
          description: 'Referral bonus'
        });

      return true;
    } catch (error) {
      console.error('Error handling referral signup:', error);
      return false;
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return await this.getUserProfileById(user.id);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getStories(): Promise<Story[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            id,
            name,
            profile_picture_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map profiles to user for backward compatibility
      return (data || []).map(story => ({
        ...story,
        user: story.profiles
      }));
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  },

  async createStory(mediaUrl: string, caption?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: 'image',
          caption: caption || null
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating story:', error);
      return false;
    }
  },

  async trackStoryView(storyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Check if already viewed
      const { data: existingView } = await supabase
        .from('story_views')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .single();

      if (existingView) return true;

      // Add view
      const { error } = await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: user.id
        });

      if (error) throw error;

      // Increment view count safely
      const { data: story } = await supabase
        .from('stories')
        .select('view_count')
        .eq('id', storyId)
        .single();

      if (story) {
        await supabase
          .from('stories')
          .update({ view_count: story.view_count + 1 })
          .eq('id', storyId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking story view:', error);
      return false;
    }
  },

  async getPostReplies(postId: string) {
    try {
      const { data, error } = await supabase
        .from('post_replies')
        .select(`
          *,
          profiles (
            id,
            name,
            profile_picture_url
          )
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

      // Increment reply count safely
      const { data: post } = await supabase
        .from('posts')
        .select('reply_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ reply_count: post.reply_count + 1 })
          .eq('id', postId);
      }

      return true;
    } catch (error) {
      console.error('Error adding post reply:', error);
      return false;
    }
  }
};
