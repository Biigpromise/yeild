
import React, { useState, useEffect } from 'react';
import { userService, ReferralBirdLevel } from '@/services/userService';
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
      
      // Get user's profile with referral counts
      const profile = await userService.getUserProfile(userId);
      
      if (profile) {
        const activeReferrals = profile.active_referrals_count || 0;
        const userPoints = profile.points || 0;
        const level = userService.getBirdLevel(activeReferrals, userPoints);
        setBirdLevel(level);
      }
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
