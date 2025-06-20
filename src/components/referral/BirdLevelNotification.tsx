
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { ReferralBirdLevel } from '@/services/userService';
import { BirdBadge } from './BirdBadge';

interface BirdLevelNotificationProps {
  previousLevel: ReferralBirdLevel | null;
  currentLevel: ReferralBirdLevel | null;
  activeReferrals: number;
}

export const BirdLevelNotification: React.FC<BirdLevelNotificationProps> = ({
  previousLevel,
  currentLevel,
  activeReferrals
}) => {
  useEffect(() => {
    // Check if user leveled up
    if (currentLevel && previousLevel && currentLevel.minReferrals > previousLevel.minReferrals) {
      showLevelUpNotification(currentLevel);
    }
    
    // Check if user is close to next level
    if (currentLevel) {
      checkProximityNotification(currentLevel, activeReferrals);
    }
  }, [currentLevel, previousLevel, activeReferrals]);

  const showLevelUpNotification = (level: ReferralBirdLevel) => {
    toast.success(
      <div className="flex items-center gap-3">
        <BirdBadge birdLevel={level} size="md" />
        <div>
          <p className="font-semibold">Congratulations! 🎉</p>
          <p className="text-sm">You just unlocked the {level.name} badge!</p>
        </div>
      </div>,
      {
        duration: 6000,
        className: 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200',
      }
    );
  };

  const checkProximityNotification = (currentLevel: ReferralBirdLevel, referrals: number) => {
    const nextLevels = [
      { name: 'Dove', min: 5 },
      { name: 'Hawk', min: 20 },
      { name: 'Eagle', min: 100 },
      { name: 'Falcon', min: 500 },
      { name: 'Phoenix', min: 1000 }
    ];

    const nextLevel = nextLevels.find(level => referrals < level.min);
    if (!nextLevel) return;

    const remaining = nextLevel.min - referrals;
    
    // Show notification when 1 referral away from next level
    if (remaining === 1) {
      toast.info(
        <div className="flex items-center gap-3">
          <div className="text-2xl">🔥</div>
          <div>
            <p className="font-semibold">So close!</p>
            <p className="text-sm">You're 1 referral away from becoming a {nextLevel.name}!</p>
          </div>
        </div>,
        {
          duration: 5000,
          className: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200',
        }
      );
    }
  };

  return null;
};
