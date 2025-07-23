
import React from 'react';
import { SimplifiedDashboardStats } from './SimplifiedDashboardStats';

interface StatsCardsProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    rank: number;
    referrals: number;
    followers: number;
    following: number;
  };
  totalPointsEarned?: number;
  withdrawalStats?: {
    pendingWithdrawals: number;
    completedWithdrawals: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ userStats }) => {
  return (
    <SimplifiedDashboardStats userStats={userStats} />
  );
};
