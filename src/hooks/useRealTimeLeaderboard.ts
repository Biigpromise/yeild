import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardUser } from '@/components/leaderboard/types';

export const useRealTimeLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    // Set up real-time subscription for profile updates
    const channelName = `leaderboard-updates-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Reload leaderboard when any profile changes
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard_data');
      
      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }
      
      setLeaderboard((data || []).map((user, index) => ({
        ...user,
        profile_picture_url: user.profile_picture_url || undefined,
        rank: index + 1
      })));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return { leaderboard, loading, refreshLeaderboard: loadLeaderboard };
};