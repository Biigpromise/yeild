
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";
import { LeaderboardUser } from "./types";
import { getRankIcon, getRankBadgeColor } from "./utils";

interface LeaderboardUserItemProps {
  user: LeaderboardUser;
  index: number;
  showPoints?: boolean;
}

export const LeaderboardUserItem: React.FC<LeaderboardUserItemProps> = ({ 
  user, 
  index, 
  showPoints = true 
}) => {
  const displayRank = showPoints ? user.rank : index + 1;
  
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
        index < 3 ? 'border-primary/20 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-8">
          {getRankIcon(displayRank)}
        </div>
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile_picture_url} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1">
            <ProfileBirdBadge userId={user.id} size="sm" />
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{user.name}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Level {user.level} • {showPoints ? `${user.tasks_completed} tasks completed` : `${user.points.toLocaleString()} points`}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <Badge className={getRankBadgeColor(displayRank)}>
          {showPoints ? `${user.points.toLocaleString()} pts` : `${user.tasks_completed} tasks`}
        </Badge>
      </div>
    </div>
  );
};
