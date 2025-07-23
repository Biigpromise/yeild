
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BirdProgressionModal } from '@/components/referral/BirdProgressionModal';
import { RealisticPhoenixBird } from '@/components/referral/RealisticPhoenixBird';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardHeaderProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    referrals: number;
  };
  userProfile: any;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userStats, 
  userProfile 
}) => {
  const { user } = useAuth();
  const [showBirdModal, setShowBirdModal] = useState(false);

  const activeReferrals = userProfile?.active_referrals_count || 0;
  const currentBirdLevel = userService.getBirdLevel(activeReferrals, userStats.points);

  const getBirdEmoji = (level: any) => {
    if (level.icon === 'phoenix') {
      return <RealisticPhoenixBird size="md" animate={true} />;
    }
    switch (level.name) {
      case 'Falcon': return '🦅';
      case 'Eagle': return '🦅';
      case 'Hawk': return '🦅';
      default: return '🕊️';
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowBirdModal(true)}
                  className="p-2 hover:bg-blue-100 rounded-full"
                  title="Click to view bird progression"
                >
                  {getBirdEmoji(currentBirdLevel)}
                </Button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">
                      Welcome back, {userProfile?.name || 'User'}!
                    </h2>
                    <Badge 
                      className="text-white"
                      style={{ backgroundColor: currentBirdLevel.color }}
                    >
                      {currentBirdLevel.name}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {currentBirdLevel.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{activeReferrals}</span>
                </div>
                <div className="text-sm text-muted-foreground">Active Referrals</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{userStats.points}</span>
                </div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Level {userStats.level}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                ${(userStats.points * 0.1).toFixed(2)} earned
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBirdModal(true)}
              className="ml-auto"
            >
              View Progression
            </Button>
          </div>
        </CardContent>
      </Card>

      <BirdProgressionModal 
        open={showBirdModal} 
        onOpenChange={setShowBirdModal} 
      />
    </>
  );
};
