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
};
