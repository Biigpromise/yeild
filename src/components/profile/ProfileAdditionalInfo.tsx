
import React from "react";
import { Calendar, Flame, Target, Trophy } from "lucide-react";

interface ProfileAdditionalInfoProps {
  user: {
    joinDate: string;
    longestStreak: number;
    totalPointsEarned?: number;
    completionRate?: number;
  };
  formatDate: (dateString: string) => string;
}

export const ProfileAdditionalInfo = ({ user, formatDate }: ProfileAdditionalInfoProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">{formatDate(user.joinDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Longest Streak</p>
              <p className="text-sm text-muted-foreground">{user.longestStreak} days</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {user.totalPointsEarned && (
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Points Earned</p>
                <p className="text-sm text-muted-foreground">{user.totalPointsEarned.toLocaleString()}</p>
              </div>
            </div>
          )}
          {user.completionRate && (
            <div className="flex items-center gap-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-sm text-muted-foreground">{user.completionRate}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
