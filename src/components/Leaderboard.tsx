
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { userService, LeaderboardUser } from "@/services/userService";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";

export const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const leaderboardData = await userService.getLeaderboard();
      setUsers(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600 bg-yellow-50";
    if (rank === 2) return "text-gray-600 bg-gray-50";
    if (rank === 3) return "text-amber-700 bg-amber-50";
    return "text-gray-500 bg-gray-50";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                user.rank <= 3 ? getRankColor(user.rank) : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {getRankIcon(user.rank) || user.rank}
                </Badge>
              </div>
              
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1">
                  <ProfileBirdBadge userId={user.id} size="sm" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  <ProfileBirdBadge userId={user.id} size="sm" showName />
                </div>
                <p className="text-sm text-muted-foreground">
                  Level {user.level} • {user.tasks_completed} tasks completed
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-lg">{user.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leaderboard data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
