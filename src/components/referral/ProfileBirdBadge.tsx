
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
      
      // Get user's profile with referral counts
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('active_referrals_count, total_referrals_count, points, tasks_completed')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        // If no profile found, user gets default qualification
        setIsQualified(true);
        const level = await userService.getBirdLevel(0, 0);
        setBirdLevel(level);
      } else {
        const activeReferrals = profile.active_referrals_count || 0;
        const userPoints = profile.points || 0;
        const tasksCompleted = profile.tasks_completed || 0;
        
        // All users get a bird badge (even new users)
        setIsQualified(true);
        const level = await userService.getBirdLevel(activeReferrals, userPoints);
        setBirdLevel(level);
      }
    } catch (error) {
      console.error('Error loading bird level:', error);
      // On error, still show default bird badge
      setIsQualified(true);
      const level = await userService.getBirdLevel(0, 0);
      setBirdLevel(level);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state briefly, then show badge for all users
  if (loading) {
    return null;
  }

  // Always show a bird badge for users
  if (!birdLevel) {
    return null; // Will load async
  }

  return (
    <div className="flex items-center gap-1">
      <BirdBadge 
        birdLevel={birdLevel} 
        size={size} 
        showName={showName}
        className={className}
      />
    </div>
  );
};
