
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Calendar } from "lucide-react";

interface ProfileStatsProps {
  user: {
    level: number;
    points: number;
    tasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    totalPointsEarned?: number;
    averageTaskRating?: number;
    favoriteCategory?: string;
    completionRate?: number;
  };
}

export const ProfileStats = ({ user }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
        <div className="text-2xl font-bold text-white">{user.level}</div>
        <div className="text-sm text-gray-400">Level</div>
      </div>
      
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
        <div className="text-2xl font-bold text-white">{user.points.toLocaleString()}</div>
        <div className="text-sm text-gray-400">Points</div>
      </div>
      
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <Calendar className="h-6 w-6 mx-auto mb-2 text-green-500" />
        <div className="text-2xl font-bold text-white">{user.tasksCompleted}</div>
        <div className="text-sm text-gray-400">Tasks Done</div>
      </div>
      
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <Flame className="h-6 w-6 mx-auto mb-2 text-orange-500" />
        <div className="text-2xl font-bold text-white">{user.currentStreak}</div>
        <div className="text-sm text-gray-400">Current Streak</div>
      </div>
    </div>
  );
};
