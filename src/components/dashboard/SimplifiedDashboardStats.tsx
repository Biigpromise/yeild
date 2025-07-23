
import React from 'react';

interface SimplifiedDashboardStatsProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    rank: number;
    referrals: number;
  };
}

export const SimplifiedDashboardStats: React.FC<SimplifiedDashboardStatsProps> = ({ userStats }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-400">{userStats.points.toLocaleString()}</div>
        <div className="text-sm text-gray-400">Points</div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-400">{userStats.level}</div>
        <div className="text-sm text-gray-400">Level</div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-green-400">{userStats.tasksCompleted}</div>
        <div className="text-sm text-gray-400">Tasks</div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-orange-400">{userStats.currentStreak}</div>
        <div className="text-sm text-gray-400">Streak</div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-purple-400">{userStats.rank || 'N/A'}</div>
        <div className="text-sm text-gray-400">Rank</div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-pink-400">{userStats.referrals}</div>
        <div className="text-sm text-gray-400">Referrals</div>
      </div>
    </div>
  );
};
