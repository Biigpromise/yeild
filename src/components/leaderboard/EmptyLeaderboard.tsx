
import React from "react";
import { Trophy } from "lucide-react";

export const EmptyLeaderboard: React.FC = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No users found on the leaderboard yet.</p>
      <p className="text-sm mt-2">Be the first to earn points and climb the ranks!</p>
    </div>
  );
};
