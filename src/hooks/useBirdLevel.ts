
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
          return;
        }

        if (profile) {
          const stats = {
            referrals: profile.active_referrals_count || 0,
            points: profile.points || 0,
            tasksCompleted: profile.tasks_completed || 0
          };
          setUserStats(stats);

          // Get current bird level
          const { data: currentBirdData, error: currentError } = await supabase
            .rpc('get_user_bird_level', { user_id_param: user.id });

          if (currentError) {
            console.error('Error fetching current bird level:', currentError);
            setError('Failed to load bird level');
          } else if (currentBirdData && currentBirdData.length > 0) {
            const birdWithDefaults: BirdLevel = {
              ...currentBirdData[0],
              benefits: currentBirdData[0].benefits || [],
              animation_type: currentBirdData[0].animation_type || 'static',
              glow_effect: currentBirdData[0].glow_effect || false,
              earningRate: 1.0
            };
            setCurrentBird(birdWithDefaults);
          }

          // Get next bird level
          const { data: nextBirdData, error: nextError } = await supabase
            .rpc('get_next_bird_level', { user_id_param: user.id });

          if (nextError) {
            console.error('Error fetching next bird level:', nextError);
          } else if (nextBirdData && nextBirdData.length > 0) {
            const nextBirdLevel: NextBirdLevel = {
              ...nextBirdData[0],
              benefits: nextBirdData[0].benefits || [],
              animation_type: nextBirdData[0].animation_type || 'static',
              glow_effect: nextBirdData[0].glow_effect || false,
              earningRate: 1.0
            };
            setNextBird(nextBirdLevel);
          }
        }
      } catch (error) {
        console.error('Error fetching bird level:', error);
        setError('Failed to load bird data');
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
