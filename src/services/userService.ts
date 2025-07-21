
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReferralBirdLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  min_referrals: number;
  min_points: number;
  description: string;
  benefits: string[];
}

export interface UserStats {
  points: number;
  level: string;
  tasksCompleted: number;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  is_active: boolean;
  created_at: string;
  referred_user?: {
    id: string;
    name: string;
    email: string;
    profile_picture_url?: string;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  bird_level: ReferralBirdLevel;
  next_bird_level?: ReferralBirdLevel;
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  user?: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  points: number;
  level: string;
  active_referrals_count: number;
  total_referrals_count: number;
  tasks_completed: number;
  created_at: string;
  updated_at: string;
}

export interface PostReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
}

export const BIRD_LEVELS: ReferralBirdLevel[] = [
  {
    id: 1,
    name: 'Chick',
    icon: '🐣',
    color: '#fbbf24',
    min_referrals: 0,
    min_points: 0,
    description: 'Welcome to the nest! Start your journey.',
    benefits: ['Access to basic features']
  },
  {
    id: 2,
    name: 'Sparrow',
    icon: '🐦',
    color: '#8b5cf6',
    min_referrals: 1,
    min_points: 50,
    description: 'Taking your first flights!',
    benefits: ['Bonus points on tasks', 'Priority support']
  },
  {
    id: 3,
    name: 'Eagle',
    icon: '🦅',
    color: '#ef4444',
    min_referrals: 5,
    min_points: 500,
    description: 'Soaring high with impressive referrals!',
    benefits: ['Higher task rewards', 'Exclusive challenges', 'Priority review']
  },
  {
    id: 4,
    name: 'Phoenix',
    icon: '🔥',
    color: '#f97316',
    min_referrals: 15,
    min_points: 2000,
    description: 'Legendary status achieved!',
    benefits: ['Maximum rewards', 'VIP status', 'Special recognition', 'Early access']
  }
];

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  operation: () => Promise<T>,
  context: string,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`${context} - Attempt ${i + 1} failed:`, error);
      
      if (i === attempts - 1) {
        throw error;
      }
      
      await sleep(RETRY_DELAY * (i + 1)); // Exponential backoff
    }
  }
  throw new Error(`${context} failed after ${attempts} attempts`);
};

export const userService = {
  async getUserProfile(userId: string) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch user profile: ${error.message}`);
        }

        return data;
      }, 'getUserProfile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
      return null;
    }
  },

  async getCurrentUser() {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error(`Failed to fetch current user: ${error.message}`);
        }

        return data;
      }, 'getCurrentUser');
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  async getUserStats(): Promise<UserStats | null> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('points, level, tasks_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error(`Failed to fetch user stats: ${error.message}`);
        }

        return {
          points: data.points || 0,
          level: String(data.level || 1),
          tasksCompleted: data.tasks_completed || 0
        };
      }, 'getUserStats');
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  },

  async getPointTransactions() {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('point_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch point transactions: ${error.message}`);
        }

        return data || [];
      }, 'getPointTransactions');
    } catch (error) {
      console.error('Error fetching point transactions:', error);
      return [];
    }
  },

  async searchUsers(query: string, limit: number = 10) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(limit);

        if (error) {
          throw new Error(`Failed to search users: ${error.message}`);
        }

        return data || [];
      }, 'searchUsers');
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  async getPostReplies(postId: string): Promise<PostReply[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('post_replies')
          .select(`
            *,
            profiles!inner(id, name, profile_picture_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch post replies: ${error.message}`);
        }

        return data || [];
      }, 'getPostReplies');
    } catch (error) {
      console.error('Error fetching post replies:', error);
      return [];
    }
  },

  async addPostReply(postId: string, content: string): Promise<boolean> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('post_replies')
          .insert({
            post_id: postId,
            user_id: user.id,
            content
          });

        if (error) {
          throw new Error(`Failed to add post reply: ${error.message}`);
        }

        return true;
      }, 'addPostReply');
    } catch (error) {
      console.error('Error adding post reply:', error);
      toast.error('Failed to add reply');
      return false;
    }
  },

  async getUserReferralCode(): Promise<string | null> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error(`Failed to fetch referral code: ${error.message}`);
        }

        return data?.referral_code || null;
      }, 'getUserReferralCode');
    } catch (error) {
      console.error('Error fetching referral code:', error);
      return null;
    }
  },

  async getReferralStats(): Promise<ReferralStats | null> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
          .from('profiles')
          .select('active_referrals_count, total_referrals_count, points')
          .eq('id', user.id)
          .single();

        if (error) {
          throw new Error(`Failed to fetch referral stats: ${error.message}`);
        }

        const activeReferrals = data.active_referrals_count || 0;
        const totalReferrals = data.total_referrals_count || 0;
        const points = data.points || 0;

        const bird_level = this.getBirdLevel(activeReferrals, points);
        const next_bird_level = this.getNextBirdLevel(activeReferrals, points);

        return {
          totalReferrals,
          activeReferrals,
          bird_level,
          next_bird_level
        };
      }, 'getReferralStats');
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }
  },

  async getUserReferrals(): Promise<UserReferral[]> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('user_referrals')
          .select(`
            *,
            profiles!user_referrals_referred_id_fkey(id, name, email, profile_picture_url)
          `)
          .eq('referrer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch user referrals: ${error.message}`);
        }

        return (data || []).map(item => ({
          ...item,
          referred_user: item.profiles && typeof item.profiles === 'object' && 'id' in item.profiles && item.profiles.id ? {
            id: item.profiles.id,
            name: item.profiles?.name || '',
            email: item.profiles?.email || '',
            profile_picture_url: item.profiles?.profile_picture_url || undefined
          } : undefined
        }));
      }, 'getUserReferrals');
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  },

  async createStory(mediaUrl: string, caption?: string): Promise<boolean> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { error } = await supabase
          .from('stories')
          .insert({
            user_id: user.id,
            media_url: mediaUrl,
            caption,
            expires_at: expiresAt.toISOString()
          });

        if (error) {
          throw new Error(`Failed to create story: ${error.message}`);
        }

        toast.success('Story posted successfully!');
        return true;
      }, 'createStory');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to post story');
      return false;
    }
  },

  async getStories(): Promise<Story[]> {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('stories')
          .select(`
            *,
            profiles!inner(id, name, profile_picture_url, email, followers_count, following_count, points, level, active_referrals_count, total_referrals_count, tasks_completed, created_at, updated_at, bio)
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch stories: ${error.message}`);
        }

        return (data || []).map(item => ({
          ...item,
          views_count: item.view_count || 0,
          user: item.profiles ? {
            id: item.profiles.id,
            name: item.profiles.name,
            email: item.profiles.email,
            profile_picture_url: item.profiles.profile_picture_url,
            bio: item.profiles.bio || undefined,
            followers_count: item.profiles.followers_count,
            following_count: item.profiles.following_count,
            points: item.profiles.points,
            level: String(item.profiles.level),
            active_referrals_count: item.profiles.active_referrals_count,
            total_referrals_count: item.profiles.total_referrals_count,
            tasks_completed: item.profiles.tasks_completed,
            created_at: item.profiles.created_at,
            updated_at: item.profiles.updated_at
          } : undefined
        }));
      }, 'getStories');
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  },

  async trackStoryView(storyId: string): Promise<boolean> {
    try {
      return await withRetry(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
          .from('story_views')
          .insert({
            story_id: storyId,
            user_id: user.id
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          throw new Error(`Failed to track story view: ${error.message}`);
        }

        return true;
      }, 'trackStoryView');
    } catch (error) {
      console.error('Error tracking story view:', error);
      return false;
    }
  },

  getBirdLevel(activeReferrals: number, userPoints: number): ReferralBirdLevel {
    let qualifiedLevel = BIRD_LEVELS[0];
    
    for (const level of BIRD_LEVELS) {
      if (activeReferrals >= level.min_referrals && userPoints >= level.min_points) {
        qualifiedLevel = level;
      }
    }

    return qualifiedLevel;
  },

  getNextBirdLevel(activeReferrals: number, userPoints: number): ReferralBirdLevel | undefined {
    const currentLevel = this.getBirdLevel(activeReferrals, userPoints);
    const currentIndex = BIRD_LEVELS.findIndex(level => level.id === currentLevel.id);
    
    if (currentIndex < BIRD_LEVELS.length - 1) {
      return BIRD_LEVELS[currentIndex + 1];
    }
    
    return undefined;
  },

  async updateUserStats(userId: string, stats: Partial<any>) {
    try {
      return await withRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update(stats)
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update user stats: ${error.message}`);
        }

        return data;
      }, 'updateUserStats');
    } catch (error) {
      console.error('Error updating user stats:', error);
      toast.error('Failed to update user stats');
      return null;
    }
  }
};
