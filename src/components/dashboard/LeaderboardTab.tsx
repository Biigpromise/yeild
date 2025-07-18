
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Star, Crown } from 'lucide-react';

export const LeaderboardTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yeild-yellow" />
            <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
            <p className="text-muted-foreground mb-4">See how you rank against other YEILDers</p>
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yeild-yellow to-yellow-400">
                  {rank === 1 && <Crown className="h-4 w-4 text-white" />}
                  {rank === 2 && <Medal className="h-4 w-4 text-white" />}
                  {rank === 3 && <Star className="h-4 w-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">Rank #{rank}</div>
                  <div className="text-sm text-muted-foreground">Complete tasks to see rankings</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">--- pts</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
