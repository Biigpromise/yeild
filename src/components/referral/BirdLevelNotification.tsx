
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
      showLevelUpNotification(currentLevel, activeReferrals);
    }
    
    // Check if user is close to next level
    if (currentLevel) {
      checkProximityNotification(currentLevel, activeReferrals);
    }
  }, [currentLevel, previousLevel, activeReferrals]);

  const showLevelUpNotification = (level: ReferralBirdLevel, referrals: number) => {
    const getSpecialMessage = (levelName: string) => {
      switch (levelName) {
        case 'Phoenix':
          return '🔥 LEGENDARY ACHIEVEMENT! You are now a Phoenix - the ultimate referral master! 🔥';
        case 'Falcon':
          return '⚡ AMAZING! You\'ve reached Falcon status with incredible speed! ⚡';
        case 'Eagle':
          return '👑 EXCELLENT! You\'ve soared to Eagle level - truly majestic! 👑';
        case 'Hawk':
          return '🦅 GREAT! You\'ve earned your Hawk wings - sharp and focused! 🦅';
        case 'Dove':
          return '🕊️ WONDERFUL! You\'ve unlocked your first Dove badge - peace and growth! 🕊️';
        default:
          return `🎉 Congratulations! You just unlocked the ${levelName} badge! 🎉`;
      }
    };

    toast.success(
      <div className="flex items-center gap-3 p-2">
        <BirdBadge birdLevel={level} size="md" />
        <div>
          <p className="font-bold text-green-800">{getSpecialMessage(level.name)}</p>
          <p className="text-sm text-green-700">
            With {referrals} active referrals, you've earned this prestigious badge!
          </p>
        </div>
      </div>,
      {
        duration: 8000,
        className: 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300',
      }
    );
  };

  const checkProximityNotification = (currentLevel: ReferralBirdLevel, referrals: number) => {
    const nextLevels = [
      { name: 'Dove', min: 5, icon: 'dove' },
      { name: 'Hawk', min: 20, icon: 'hawk' },
      { name: 'Eagle', min: 100, icon: 'eagle' },
      { name: 'Falcon', min: 500, icon: 'falcon' },
      { name: 'Phoenix', min: 1000, icon: 'phoenix' }
    ];

    const nextLevel = nextLevels.find(level => referrals < level.min);
    if (!nextLevel) return;

    const remaining = nextLevel.min - referrals;
    
    // Show notification when close to next level
    if (remaining === 1) {
      toast.info(
        <div className="flex items-center gap-3 p-2">
          <div className="text-3xl animate-bounce">🔥</div>
          <div>
            <p className="font-bold text-orange-800">So Close!</p>
            <p className="text-sm text-orange-700">
              Just 1 more referral to become a {nextLevel.name}!
            </p>
          </div>
        </div>,
        {
          duration: 6000,
          className: 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300',
        }
      );
    } else if (remaining <= 5 && remaining > 1) {
      toast.info(
        <div className="flex items-center gap-2 p-2">
          <div className="text-2xl">🎯</div>
          <div>
            <p className="font-semibold text-blue-800">Getting Close!</p>
            <p className="text-sm text-blue-700">
              {remaining} more referrals to unlock {nextLevel.name}!
            </p>
          </div>
        </div>,
        {
          duration: 4000,
          className: 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200',
        }
      );
    }
  };

  return null;
};
