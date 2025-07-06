
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { LeaderboardLoading } from "./leaderboard/LeaderboardLoading";
import { EmptyLeaderboard } from "./leaderboard/EmptyLeaderboard";
import { LeaderboardUserItem } from "./leaderboard/LeaderboardUserItem";
import { useRealTimeLeaderboard } from "@/hooks/useRealTimeLeaderboard";

export const Leaderboard = () => {
  const { leaderboard, loading } = useRealTimeLeaderboard();

  if (loading) {
    return <LeaderboardLoading />;
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
