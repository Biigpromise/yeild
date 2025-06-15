
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardStatsProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    rank: number;
    referrals: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ userStats }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-primary">{userStats.points.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Points</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-purple-600">{userStats.level}</div>
          <div className="text-xs text-muted-foreground">Level</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-green-600">{userStats.tasksCompleted}</div>
          <div className="text-xs text-muted-foreground">Tasks</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-orange-600">{userStats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Streak</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-blue-600">
            {userStats.rank > 0 ? `#${userStats.rank}` : '-'}
          </div>
          <div className="text-xs text-muted-foreground">Rank</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 text-center">
          <div className="text-sm sm:text-lg font-bold text-pink-600">{userStats.referrals}</div>
          <div className="text-xs text-muted-foreground">Referrals</div>
        </CardContent>
      </Card>
    </div>
  );
};
