
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
  const [isQualified, setIsQualified] = useState(false);

  useEffect(() => {
    loadUserBirdLevel();
  }, [userId]);

  const loadUserBirdLevel = async () => {
    try {
      setLoading(true);
      
      // First try to get user's profile with referral counts
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('active_referrals_count, total_referrals_count, points, tasks_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile for bird badge:', error);
        setIsQualified(false);
        setBirdLevel(null);
      } else if (profile) {
        const activeReferrals = profile.active_referrals_count || 0;
        const userPoints = profile.points || 0;
        const tasksCompleted = profile.tasks_completed || 0;
        
        // Only show bird badge if user has completed at least 1 task or has points
        const qualified = tasksCompleted > 0 || userPoints > 0;
        setIsQualified(qualified);
        
        if (qualified) {
          const level = userService.getBirdLevel(activeReferrals, userPoints);
          setBirdLevel(level);
        } else {
          setBirdLevel(null);
        }
      } else {
        // No profile found, user is not qualified
        setIsQualified(false);
        setBirdLevel(null);
      }
    } catch (error) {
      console.error('Error loading bird level:', error);
      setIsQualified(false);
      setBirdLevel(null);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if user is not qualified or still loading
  if (loading || !isQualified || !birdLevel) {
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
