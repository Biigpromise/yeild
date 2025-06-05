
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Crown
} from "lucide-react";

type LeaderboardUser = {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  tasksCompleted: number;
  streak: number;
  change: "up" | "down" | "same";
};

const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "",
    points: 15420,
    level: 25,
    rank: 1,
    tasksCompleted: 342,
    streak: 28,
    change: "up"
  },
  {
    id: "2",
    name: "Mike Chen",
    avatar: "",
    points: 14890,
    level: 24,
    rank: 2,
    tasksCompleted: 298,
    streak: 15,
    change: "same"
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "",
    points: 13650,
    level: 22,
    rank: 3,
    tasksCompleted: 267,
    streak: 12,
    change: "up"
  },
  {
    id: "4",
    name: "John Doe",
    avatar: "",
    points: 12450,
    level: 21,
    rank: 4,
    tasksCompleted: 234,
    streak: 8,
    change: "down"
  },
  {
    id: "5",
    name: "Lisa Brown",
    avatar: "",
    points: 11200,
    level: 19,
    rank: 5,
    tasksCompleted: 189,
    streak: 5,
    change: "up"
  }
];

export const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all">("weekly");
  const [currentUserRank] = useState(12);

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

              {/* Top Users */}
              <div className="space-y-2">
                {mockLeaderboardData.map((user) => (
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
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{user.name}</span>
                              <Badge variant="secondary">Level {user.level}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{user.tasksCompleted} tasks</span>
                              <span>{user.streak} day streak</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary">
                              {user.points.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">pts</span>
                            {getChangeIcon(user.change)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center pt-4">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Load More Users
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
