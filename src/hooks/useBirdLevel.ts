
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
  min_tasks: number;
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
  tasks_needed: number;
}

// Task-based bird levels (referrals provide bonus, not required)
const DEFAULT_BIRD_LEVELS: BirdLevel[] = [
  {
    id: 1,
    name: 'Dove',
    icon: '🕊️',
    emoji: '🕊️',
    min_referrals: 0,
    min_points: 0,
    min_tasks: 0,
    description: 'Starting your journey',
    color: '#64748b',
    benefits: ['Basic community access'],
    animation_type: 'static',
    glow_effect: false,
    earningRate: 1.0
  },
  {
    id: 2,
    name: 'Sparrow',
    icon: '🐦',
    emoji: '🐦',
    min_referrals: 0,
    min_points: 100,
    min_tasks: 5,
    description: 'Building momentum',
    color: '#22c55e',
    benefits: ['Enhanced task visibility', '+5% bonus'],
    animation_type: 'static',
    glow_effect: false,
    earningRate: 1.05
  },
  {
    id: 3,
    name: 'Hawk',
    icon: '🦅',
    emoji: '🦅',
    min_referrals: 0,
    min_points: 500,
    min_tasks: 20,
    description: 'Mastering tasks',
    color: '#eab308',
    benefits: ['Exclusive task access', '+10% bonus'],
    animation_type: 'static',
    glow_effect: true,
    earningRate: 1.1
  },
  {
    id: 4,
    name: 'Eagle',
    icon: '🦅',
    emoji: '🦅',
    min_referrals: 0,
    min_points: 1500,
    min_tasks: 50,
    description: 'Soaring high',
    color: '#ef4444',
    benefits: ['Custom badge', 'Early access'],
    animation_type: 'static',
    glow_effect: true,
    earningRate: 1.12
  },
  {
    id: 5,
    name: 'Phoenix',
    icon: '🔥',
    emoji: '🔥',
    min_referrals: 0,
    min_points: 5000,
    min_tasks: 100,
    description: 'Legendary status',
    color: '#a855f7',
    benefits: ['VIP access', '+15% bonus', 'Priority support'],
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

  // Task-based level calculation (referrals are bonus only)
  const getCurrentBirdLevel = (stats: { referrals: number; points: number; tasksCompleted: number }) => {
    let currentLevel = DEFAULT_BIRD_LEVELS[0];
    for (const level of DEFAULT_BIRD_LEVELS) {
      if (stats.tasksCompleted >= level.min_tasks && stats.points >= level.min_points) {
        currentLevel = level;
      } else {
        break;
      }
    }
    return currentLevel;
  };

  const getNextBirdLevel = (stats: { referrals: number; points: number; tasksCompleted: number }): NextBirdLevel | null => {
    for (const level of DEFAULT_BIRD_LEVELS) {
      if (stats.tasksCompleted < level.min_tasks || stats.points < level.min_points) {
        return {
          ...level,
          referrals_needed: 0,
          points_needed: Math.max(0, level.min_points - stats.points),
          tasks_needed: Math.max(0, level.min_tasks - stats.tasksCompleted)
        };
      }
    }
    return null;
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
            const rawBird = currentBirdData[0] as any;
            const enhancedBird: BirdLevel = {
              id: rawBird.id,
              name: rawBird.name,
              icon: rawBird.icon,
              emoji: rawBird.emoji,
              min_referrals: rawBird.min_referrals || 0,
              min_points: rawBird.min_points || 0,
              min_tasks: rawBird.min_tasks || current.min_tasks || 0,
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
              min_referrals: rawNextBird.min_referrals || 0,
              min_points: rawNextBird.min_points || 0,
              min_tasks: rawNextBird.min_tasks || 0,
              description: rawNextBird.description,
              color: rawNextBird.color,
              referrals_needed: rawNextBird.referrals_needed || 0,
              points_needed: rawNextBird.points_needed || 0,
              tasks_needed: rawNextBird.tasks_needed || 0,
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
