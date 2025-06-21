
import React from 'react';
import { ReferralBirdLevel } from '@/services/userService';
import { EnhancedBirdBadge } from './EnhancedBirdBadge';

interface BirdBadgeProps {
  birdLevel: ReferralBirdLevel | null;
  activeReferrals?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

export const BirdBadge: React.FC<BirdBadgeProps> = ({ 
  birdLevel, 
  activeReferrals = 0,
  size = 'md', 
  showName = false,
  className = ''
}) => {
  return (
    <EnhancedBirdBadge 
      birdLevel={birdLevel}
      activeReferrals={activeReferrals}
      size={size}
      showName={showName}
      className={className}
      showAnimation={true}
    />
  );
};
