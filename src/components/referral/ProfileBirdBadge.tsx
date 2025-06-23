
import React, { useState, useEffect } from 'react';
import { userService, ReferralBirdLevel } from '@/services/userService';
import { BirdBadge } from './BirdBadge';
import { supabase } from '@/integrations/supabase/client';

interface ProfileBirdBadgeProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const ProfileBirdBadge: React.FC<ProfileBirdBadgeProps> = ({ 
  userId, 
  size = 'sm', 
  showName = false,
  className = ''
}) => {
  const [birdLevel, setBirdLevel] = useState<ReferralBirdLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBirdLevel();
  }, [userId]);

  const loadUserBirdLevel = async () => {
    try {
      setLoading(true);
      
      // First try to get user's profile with referral counts
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('active_referrals_count, total_referrals_count, points')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile for bird badge:', error);
        // Fallback to default bird level
        const defaultLevel = userService.getBirdLevel(0, 0);
        setBirdLevel(defaultLevel);
      } else if (profile) {
        const activeReferrals = profile.active_referrals_count || 0;
        const userPoints = profile.points || 0;
        const level = userService.getBirdLevel(activeReferrals, userPoints);
        setBirdLevel(level);
      } else {
        // No profile found, use default level
        const defaultLevel = userService.getBirdLevel(0, 0);
        setBirdLevel(defaultLevel);
      }
    } catch (error) {
      console.error('Error loading bird level:', error);
      // Fallback to default bird level
      const defaultLevel = userService.getBirdLevel(0, 0);
      setBirdLevel(defaultLevel);
    } finally {
      setLoading(false);
    }
  };

  // Show a default bird badge while loading or if no level found
  if (loading || !birdLevel) {
    const defaultLevel = userService.getBirdLevel(0, 0);
    return (
      <BirdBadge 
        birdLevel={defaultLevel} 
        size={size} 
        showName={showName}
        className={className}
      />
    );
  }

  return (
    <BirdBadge 
      birdLevel={birdLevel} 
      size={size} 
      showName={showName}
      className={className}
    />
  );
};
