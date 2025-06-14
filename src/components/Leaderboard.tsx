
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService, LeaderboardUser } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Crown
} from "lucide-react";

export const Leaderboard = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all">("weekly");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await userService.getLeaderboard(50);
      setLeaderboardData(data);
      
      // Find current user's rank
      if (user) {
        const userRank = data.findIndex(u => u.id === user.id);
        setCurrentUserRank(userRank >= 0 ? userRank + 1 : null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-4 mt-6">
              {/* Your Rank */}
              {currentUserRank && (
                <Card className="bg-muted/50 border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Your Rank:</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          #{currentUserRank}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        View My Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Users */}
              <div className="space-y-2">
                {leaderboardData.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No leaderboard data available yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">Complete some tasks to see rankings!</p>
                    </CardContent>
                  </Card>
                ) : (
                  leaderboardData.map((user) => (
                    <Card key={user.id} className={`transition-all hover:shadow-md ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12">
                              {getRankIcon(user.rank)}
                            </div>
                            
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{user.name || 'Anonymous User'}</span>
                                <Badge variant="secondary">Level {user.level}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{user.tasks_completed} tasks</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary">
                                {user.points.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground">pts</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Load More */}
              {leaderboardData.length >= 50 && (
                <div className="text-center pt-4">
                  <Button variant="outline" className="w-full" onClick={loadLeaderboard}>
                    <Users className="h-4 w-4 mr-2" />
                    Load More Users
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
