
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
}

export const useBirdLevel = () => {
  const { user } = useAuth();
  const [currentBird, setCurrentBird] = useState<BirdLevel | null>(null);
  const [nextBird, setNextBird] = useState<BirdLevel | null>(null);
  const [userStats, setUserStats] = useState({
    referrals: 0,
    points: 0,
    tasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchBirdLevel = async () => {
      try {
        // Get user's current stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_referrals_count, points, tasks_completed')
          .eq('id', user.id)
          .single();

        if (profile) {
          const stats = {
            referrals: profile.active_referrals_count || 0,
            points: profile.points || 0,
            tasksCompleted: profile.tasks_completed || 0
          };
          setUserStats(stats);

          // Get current bird level
          const { data: currentBirdData } = await supabase
            .rpc('get_user_bird_level', { user_id_param: user.id });

          if (currentBirdData && currentBirdData.length > 0) {
            setCurrentBird(currentBirdData[0]);
          }

          // Get next bird level
          const { data: nextBirdData } = await supabase
            .rpc('get_next_bird_level', { user_id_param: user.id });

          if (nextBirdData && nextBirdData.length > 0) {
            setNextBird(nextBirdData[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching bird level:', error);
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
    loading
  };
};
