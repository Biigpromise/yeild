
import React from "react";
import { Trophy, Target, Flame } from "lucide-react";

interface ProfileStatsProps {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    level: number;
    points: number;
    tasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    joinDate: string;
    totalPointsEarned?: number;
    averageTaskRating?: number;
    favoriteCategory?: string;
    completionRate?: number;
    followers_count: number;
    following_count: number;
    active_referrals_count: number;
    total_referrals_count: number;
  };
}

export const ProfileStats = ({ user }: ProfileStatsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted rounded-lg">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
          <p className="text-2xl font-bold">Level {user.level}</p>
          <p className="text-sm text-muted-foreground">Current Level</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Points</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <Trophy className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold">{user.tasksCompleted}</p>
          <p className="text-sm text-muted-foreground">Tasks Completed</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
          <p className="text-2xl font-bold">{user.currentStreak}</p>
          <p className="text-sm text-muted-foreground">Current Streak</p>
        </div>
      </div>
    </div>
  );
};
