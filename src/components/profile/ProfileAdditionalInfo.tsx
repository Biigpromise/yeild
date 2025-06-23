
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProfileAdditionalInfoProps {
  user: {
    joinDate: string;
    longestStreak: number;
    totalPointsEarned?: number;
    averageTaskRating?: number;
    favoriteCategory?: string;
    completionRate?: number;
  };
  formatDate: (dateString: string) => string;
}

export const ProfileAdditionalInfo = ({ user, formatDate }: ProfileAdditionalInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Additional Information</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-400">Member since:</span>
          <p className="font-medium text-white">{formatDate(user.joinDate)}</p>
        </div>
        
        <div>
          <span className="text-gray-400">Longest streak:</span>
          <p className="font-medium text-white">{user.longestStreak} days</p>
        </div>
        
        {user.totalPointsEarned && (
          <div>
            <span className="text-gray-400">Total earned:</span>
            <p className="font-medium text-white">{user.totalPointsEarned.toLocaleString()} points</p>
          </div>
        )}
        
        {user.averageTaskRating && (
          <div>
            <span className="text-gray-400">Avg. rating:</span>
            <p className="font-medium text-white">{user.averageTaskRating}/5.0</p>
          </div>
        )}
        
        {user.favoriteCategory && (
          <div>
            <span className="text-gray-400">Favorite category:</span>
            <Badge variant="secondary" className="mt-1 bg-gray-700 text-white">
              {user.favoriteCategory}
            </Badge>
          </div>
        )}
        
        {user.completionRate && (
          <div>
            <span className="text-gray-400">Completion rate:</span>
            <p className="font-medium text-white">{user.completionRate}%</p>
          </div>
        )}
      </div>
    </div>
  );
};
