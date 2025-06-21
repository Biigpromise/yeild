
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ReferralBirdLevel } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BirdProgressIndicatorProps {
  currentBirdLevel: ReferralBirdLevel;
  nextBirdLevel?: ReferralBirdLevel;
  activeReferrals: number;
  className?: string;
}

export const BirdProgressIndicator: React.FC<BirdProgressIndicatorProps> = ({
  currentBirdLevel,
  nextBirdLevel,
  activeReferrals,
  className = ''
}) => {
  if (!nextBirdLevel) {
    return null;
  }

  const progress = Math.min(100, (activeReferrals / nextBirdLevel.minReferrals) * 100);
  const referralsNeeded = Math.max(0, nextBirdLevel.minReferrals - activeReferrals);

  const getProgressColor = () => {
    switch (nextBirdLevel.icon) {
      case 'hawk':
        return 'bg-amber-500';
      case 'eagle':
        return 'bg-blue-500';
      case 'falcon':
        return 'bg-purple-500';
      case 'phoenix':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBenefits = (birdIcon: string) => {
    switch (birdIcon) {
      case 'hawk':
        return 'Access to premium tasks';
      case 'eagle':
        return 'Leaderboard visibility & exclusive badges';
      case 'falcon':
        return 'Special rank status & early task access';
      case 'phoenix':
        return 'Elite status & exclusive Phoenix rewards';
      default:
        return 'Enhanced profile features';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Progress to {nextBirdLevel.name}
        </span>
        <span className="text-xs font-mono">
          {activeReferrals}/{nextBirdLevel.minReferrals}
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
        // @ts-ignore - Custom color override
        style={{ '--progress-background': getProgressColor() }}
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {referralsNeeded} referrals to unlock
        </span>
        <Badge variant="outline" className="text-xs">
          {getBenefits(nextBirdLevel.icon)}
        </Badge>
      </div>
    </div>
  );
};
