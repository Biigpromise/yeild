
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

export const usePhoenixStatus = () => {
  const { user } = useAuth();
  const [isPhoenix, setIsPhoenix] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const profile = await userService.getUserProfile(user.id);
        if (profile) {
          const activeReferrals = profile.active_referrals_count || 0;
          const userPoints = profile.points || 0;
          const birdLevel = await userService.getBirdLevel(activeReferrals, userPoints);
          setIsPhoenix(birdLevel.name === 'Phoenix');
        }
      } catch (error) {
        console.error('Error checking Phoenix status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  return { isPhoenix, loading };
};
