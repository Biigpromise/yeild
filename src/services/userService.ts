
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

  getBirdLevel(activeReferrals: number, userPoints: number): ReferralBirdLevel {
    // Static bird levels based on requirements
    const birdLevels: ReferralBirdLevel[] = [
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

    // Find the highest level the user qualifies for
    let qualifiedLevel = birdLevels[0];
    
    for (const level of birdLevels) {
      if (activeReferrals >= level.min_referrals && userPoints >= level.min_points) {
        qualifiedLevel = level;
      }
    }

    return qualifiedLevel;
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
