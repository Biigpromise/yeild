
import React from 'react';
import { AchievementsList } from '@/components/achievements/AchievementsList';

interface AchievementsTabProps {
  userStats: {
    points: number;
    tasksCompleted: number;
  };
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ userStats }) => {
  return <AchievementsList userStats={userStats} />;
};
