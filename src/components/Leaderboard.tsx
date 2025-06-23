import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileBirdBadge } from "@/components/referral/ProfileBirdBadge";
import { toast } from "sonner";

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  profile_picture_url?: string;
  rank: number;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      console.log('Loading leaderboard data using RPC function...');
      
      // Use the new database function that bypasses RLS
      const { data, error } = await supabase
        .rpc('get_leaderboard_data');

      console.log('Leaderboard RPC result:', { data, error });

      if (error) {
        console.error('Error loading leaderboard via RPC:', error);
        toast.error('Failed to load leaderboard. Please try again later.');
        return;
      }

      console.log('Raw data from RPC function:', data);
      
      if (!data || data.length === 0) {
        console.log('No leaderboard data found');
        setLeaderboard([]);
        return;
      }

      // Add rank to each user
      const rankedData = data.map((user: any, index: number) => ({
        ...user,
        rank: index + 1
      }));

      console.log('Processed leaderboard data:', rankedData);
      setLeaderboard(rankedData);
      
    } catch (error) {
      console.error('Error in loadLeaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted";
    }
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
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points">Top Points</TabsTrigger>
            <TabsTrigger value="tasks">Top Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="points" className="space-y-4 mt-4">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found on the leaderboard yet.</p>
                <p className="text-sm mt-2">Be the first to earn points and climb the ranks!</p>
              </div>
            ) : (
              leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    index < 3 ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(user.rank)}
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
                        <ProfileBirdBadge userId={user.id} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level {user.level} • {user.tasks_completed} tasks completed
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getRankBadgeColor(user.rank)}>
                      {user.points.toLocaleString()} pts
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {[...leaderboard]
              .sort((a, b) => b.tasks_completed - a.tasks_completed)
              .map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    index < 3 ? 'border-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index + 1)}
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
                        <ProfileBirdBadge userId={user.id} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level {user.level} • {user.points.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getRankBadgeColor(index + 1)}>
                      {user.tasks_completed} tasks
                    </Badge>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
