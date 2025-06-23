
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaderboardUser } from "./types";

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      console.log('Loading leaderboard data using RPC function...');
      
      // Use the new database function that bypasses RLS
      const { data, error } = await supabase
        .rpc('get_leaderboard_data');

      console.log('Leaderboard RPC result:', { data, error });

      if (error) {
        console.error('Error loading leaderboard via RPC:', error);
        toast.error('Failed to load leaderboard. Please try again later.');
        return;
      }

      console.log('Raw data from RPC function:', data);
      
      if (!data || data.length === 0) {
        console.log('No leaderboard data found');
        setLeaderboard([]);
        return;
      }

      // Add rank to each user
      const rankedData = data.map((user: any, index: number) => ({
        ...user,
        rank: index + 1
      }));

      console.log('Processed leaderboard data:', rankedData);
      setLeaderboard(rankedData);
      
    } catch (error) {
      console.error('Error in loadLeaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    refetch: loadLeaderboard
  };
};
