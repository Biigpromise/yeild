
import React from 'react';
import { RewardsStore } from '@/components/rewards/RewardsStore';

interface RewardsTabProps {
  userPoints: number;
  onRedemption: () => void;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({ userPoints, onRedemption }) => {
  return <RewardsStore userPoints={userPoints} onRedemption={onRedemption} />;
};
