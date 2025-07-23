
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  benefits: string[];
  animation_type: string;
  glow_effect: boolean;
  earningRate: number;
}

export interface NextBirdLevel extends BirdLevel {
  referrals_needed: number;
  points_needed: number;
}

// Default bird levels as fallback
const DEFAULT_BIRD_LEVELS: BirdLevel[] = [
  {
    id: 1,
    name: 'Sparrow',
    icon: '🐦',
    emoji: '🐦',
    min_referrals: 0,
    min_points: 0,
    description: 'Starting your journey',
    color: '#10b981',
    benefits: ['Basic community access'],
    animation_type: 'static',
    glow_effect: false,
    earningRate: 1.0
  },
  {
    id: 2,
    name: 'Robin',
    icon: '🐦',
    emoji: '🐦',
    min_referrals: 5,
    min_points: 100,
    description: 'Growing your network',
    color: '#3b82f6',
    benefits: ['Enhanced task visibility', '+5% referral bonus'],
    animation_type: 'static',
    glow_effect: false,
    earningRate: 1.05
  },
  {
    id: 3,
    name: 'Eagle',
    icon: '🦅',
    emoji: '🦅',
    min_referrals: 15,
    min_points: 500,
    description: 'Soaring high',
    color: '#8b5cf6',
    benefits: ['Exclusive task access', '+10% referral bonus'],
    animation_type: 'static',
    glow_effect: true,
    earningRate: 1.1
  },
  {
    id: 4,
    name: 'Phoenix',
    icon: '🔥',
    emoji: '🔥',
    min_referrals: 50,
    min_points: 2000,
    description: 'Legendary status',
    color: '#f59e0b',
    benefits: ['VIP access', '+15% referral bonus', 'Priority support'],
    animation_type: 'glow',
    glow_effect: true,
    earningRate: 1.15
  }
];

export const useBirdLevel = () => {
  const { user } = useAuth();
  const [currentBird, setCurrentBird] = useState<BirdLevel | null>(null);
  const [nextBird, setNextBird] = useState<NextBirdLevel | null>(null);
  const [userStats, setUserStats] = useState({
    referrals: 0,
    points: 0,
    tasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentBirdLevel = (stats: { referrals: number; points: number }) => {
    // Find the highest level the user qualifies for
    let currentLevel = DEFAULT_BIRD_LEVELS[0];
    for (const level of DEFAULT_BIRD_LEVELS) {
      if (stats.referrals >= level.min_referrals && stats.points >= level.min_points) {
        currentLevel = level;
      } else {
        break;
      }
    }
    return currentLevel;
  };

  const getNextBirdLevel = (stats: { referrals: number; points: number }): NextBirdLevel | null => {
    // Find the next level the user can achieve
    for (const level of DEFAULT_BIRD_LEVELS) {
      if (stats.referrals < level.min_referrals || stats.points < level.min_points) {
        return {
          ...level,
          referrals_needed: Math.max(0, level.min_referrals - stats.referrals),
          points_needed: Math.max(0, level.min_points - stats.points)
        };
      }
    }
    return null; // User has reached the highest level
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBirdLevel = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's current stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('active_referrals_count, points, tasks_completed')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Failed to load profile data');
          
          // Use default stats if profile fetch fails
          const defaultStats = { referrals: 0, points: 0, tasksCompleted: 0 };
          setUserStats(defaultStats);
          setCurrentBird(getCurrentBirdLevel(defaultStats));
          setNextBird(getNextBirdLevel(defaultStats));
          return;
        }

        const stats = {
          referrals: profile?.active_referrals_count || 0,
          points: profile?.points || 0,
          tasksCompleted: profile?.tasks_completed || 0
        };
        setUserStats(stats);

        // Calculate current and next bird levels using fallback logic
        const current = getCurrentBirdLevel(stats);
        const next = getNextBirdLevel(stats);

        setCurrentBird(current);
        setNextBird(next);

        // Try to get bird levels from database, but don't fail if it doesn't work
        try {
          const { data: currentBirdData, error: currentError } = await supabase
            .rpc('get_user_bird_level', { user_id_param: user.id });

          if (!currentError && currentBirdData && currentBirdData.length > 0) {
            const rawBird = currentBirdData[0];
            const enhancedBird: BirdLevel = {
              id: rawBird.id,
              name: rawBird.name,
              icon: rawBird.icon,
              emoji: rawBird.emoji,
              min_referrals: rawBird.min_referrals,
              min_points: rawBird.min_points,
              description: rawBird.description,
              color: rawBird.color,
              benefits: rawBird.benefits || current.benefits,
              animation_type: rawBird.animation_type || current.animation_type,
              glow_effect: rawBird.glow_effect || current.glow_effect,
              earningRate: current.earningRate
            };
            setCurrentBird(enhancedBird);
          }
        } catch (rpcError) {
          console.error('RPC error for current bird level:', rpcError);
        }

        // Try to get next bird level from database
        try {
          const { data: nextBirdData, error: nextError } = await supabase
            .rpc('get_next_bird_level', { user_id_param: user.id });

          if (!nextError && nextBirdData && nextBirdData.length > 0) {
            const rawNextBird = nextBirdData[0] as any;
            const enhancedNextBird: NextBirdLevel = {
              id: rawNextBird.id,
              name: rawNextBird.name,
              icon: rawNextBird.icon,
              emoji: rawNextBird.emoji,
              min_referrals: rawNextBird.min_referrals,
              min_points: rawNextBird.min_points,
              description: rawNextBird.description,
              color: rawNextBird.color,
              referrals_needed: rawNextBird.referrals_needed,
              points_needed: rawNextBird.points_needed,
              benefits: next?.benefits || ['Enhanced rewards'],
              animation_type: next?.animation_type || 'static',
              glow_effect: next?.glow_effect || false,
              earningRate: next?.earningRate || 1.0
            };
            setNextBird(enhancedNextBird);
          }
        } catch (rpcError) {
          console.error('RPC error for next bird level:', rpcError);
        }

      } catch (error) {
        console.error('Error in fetchBirdLevel:', error);
        setError('Failed to load bird level data');
        
        // Provide fallback data
        const defaultStats = { referrals: 0, points: 0, tasksCompleted: 0 };
        setUserStats(defaultStats);
        setCurrentBird(getCurrentBirdLevel(defaultStats));
        setNextBird(getNextBirdLevel(defaultStats));
      } finally {
        setLoading(false);
      }
    };

    fetchBirdLevel();
  }, [user]);

  return {
    currentBird,
    nextBird,
    userStats,
    loading,
    error
  };
};
