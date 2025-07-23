
import React from 'react';
import { DashboardStats } from './DashboardStats';

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
  totalPointsEarned: number;
  withdrawalStats: {
    pendingWithdrawals: number;
    completedWithdrawals: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ userStats }) => {
  return <DashboardStats userStats={userStats} />;
};
