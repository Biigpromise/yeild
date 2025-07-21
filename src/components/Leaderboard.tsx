
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Lock, Users, CheckSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LeaderboardLoading } from "./leaderboard/LeaderboardLoading";
import { EmptyLeaderboard } from "./leaderboard/EmptyLeaderboard";
import { LeaderboardUserItem } from "./leaderboard/LeaderboardUserItem";
import { useRealTimeLeaderboard } from "@/hooks/useRealTimeLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";

export const Leaderboard = () => {
  const { user } = useAuth();
  const { leaderboard, loading } = useRealTimeLeaderboard();
  const { userStats } = useDashboard();
  
  // Check if user meets requirements (10 referrals and 3 tasks)
  const hasAccess = userStats && userStats.active_referrals_count >= 10 && userStats.tasks_completed >= 3;
  
  if (loading) {
    return <LeaderboardLoading />;
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Leaderboard - Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">Unlock the leaderboard by completing:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Complete 3 tasks ({userStats?.tasks_completed || 0}/3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Refer 10 friends ({userStats?.active_referrals_count || 0}/10)</span>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Leaderboard Locked
                </Button>
              </div>
            </AlertDescription>
          </Alert>
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
              <EmptyLeaderboard />
            ) : (
              leaderboard.map((user, index) => (
                <LeaderboardUserItem 
                  key={user.id}
                  user={user}
                  index={index}
                  showPoints={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            {[...leaderboard]
              .sort((a, b) => b.tasks_completed - a.tasks_completed)
              .map((user, index) => (
                <LeaderboardUserItem 
                  key={user.id}
                  user={user}
                  index={index}
                  showPoints={false}
                />
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
