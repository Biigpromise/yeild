
import React, { useState, useEffect } from 'react';
import { userService, ReferralBirdLevel } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { BirdBadge } from './BirdBadge';

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
      
      // Get user's profile for points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      const userPoints = profile?.points || 0;

      // Get user's referral stats to determine bird level
      const { data: referrals, error } = await supabase
        .from('user_referrals')
        .select('is_active')
        .eq('referrer_id', userId);

      if (error) {
        console.error('Error fetching user referrals:', error);
        return;
      }

      const activeReferrals = referrals?.filter(r => r.is_active).length || 0;
      const level = userService.getBirdLevel(activeReferrals, userPoints);
      setBirdLevel(level);
    } catch (error) {
      console.error('Error loading bird level:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !birdLevel) {
    return null;
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
