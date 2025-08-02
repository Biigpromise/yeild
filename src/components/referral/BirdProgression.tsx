
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Crown, Sparkles } from 'lucide-react';

interface BirdProgressionProps {
  userPoints: number;
  activeReferrals: number;
  currentBirdLevel: any;
  nextBirdLevel: any;
}

export const BirdProgression: React.FC<BirdProgressionProps> = ({
  userPoints,
  activeReferrals,
  currentBirdLevel,
  nextBirdLevel
}) => {
  const getBirdIcon = (level: any) => {
    if (!level) return Star;
    
    switch (level.name?.toLowerCase()) {
      case 'phoenix':
        return Crown;
      case 'eagle':
        return Trophy;
      default:
        return Star;
    }
  };

  const calculateProgress = () => {
    if (!nextBirdLevel) return 100;
    
    // If points requirement is 0 or undefined, only calculate based on referrals
    if (!nextBirdLevel.min_points || nextBirdLevel.min_points === 0) {
      const referralProgress = nextBirdLevel.min_referrals > 0 
        ? (activeReferrals / nextBirdLevel.min_referrals) * 100 
        : 100;
      return Math.min(referralProgress, 100);
    }
    
    // Legacy calculation for levels that still require points
    const referralProgress = nextBirdLevel.min_referrals > 0 
      ? (activeReferrals / nextBirdLevel.min_referrals) * 100 
      : 100;
    
    const pointsProgress = nextBirdLevel.min_points > 0 
      ? (userPoints / nextBirdLevel.min_points) * 100 
      : 100;
    
    return Math.min(Math.min(referralProgress, pointsProgress), 100);
  };

  const CurrentIcon = getBirdIcon(currentBirdLevel);
  const NextIcon = getBirdIcon(nextBirdLevel);

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Bird Badge Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center border-2"
              style={{ 
                backgroundColor: currentBirdLevel?.color + '20' || '#3B82F620',
                borderColor: currentBirdLevel?.color || '#3B82F6'
              }}
            >
              <span className="text-2xl">{currentBirdLevel?.emoji || '🐣'}</span>
            </div>
            <div>
              <Badge 
                className="mb-1"
                style={{ 
                  backgroundColor: currentBirdLevel?.color + '20' || '#3B82F620',
                  color: currentBirdLevel?.color || '#3B82F6'
                }}
              >
                {currentBirdLevel?.name || 'Hatchling'}
              </Badge>
              <div className="text-sm text-gray-300">
                Current Level
              </div>
            </div>
          </div>

          {nextBirdLevel && (
            <div className="flex items-center gap-3">
              <div>
                <Badge variant="outline" className="mb-1 border-gray-500 text-gray-300">
                  {nextBirdLevel.name}
                </Badge>
                <div className="text-sm text-gray-300 text-right">
                  Next Level
                </div>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 opacity-50"
                style={{ 
                  backgroundColor: nextBirdLevel.color + '20',
                  borderColor: nextBirdLevel.color
                }}
              >
                <span className="text-2xl">{nextBirdLevel.emoji}</span>
              </div>
            </div>
          )}
        </div>

        {nextBirdLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white">
                <span>Progress to {nextBirdLevel.name}</span>
                <span className="font-medium">{calculateProgress().toFixed(1)}%</span>
              </div>
            <Progress value={calculateProgress()} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600 shadow-sm">
                <div className="font-bold text-white text-lg">
                  {activeReferrals} / {nextBirdLevel.min_referrals}
                </div>
                <div className="text-gray-300 font-medium">Active Referrals</div>
              </div>
              {nextBirdLevel.min_points > 0 && (
                <div className="text-center p-3 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600 shadow-sm">
                  <div className="font-bold text-white text-lg">
                    {userPoints} / {nextBirdLevel.min_points}
                  </div>
                  <div className="text-gray-300 font-medium">Points Earned</div>
                </div>
              )}
            </div>
          </div>
        )}

        {!nextBirdLevel && (
          <div className="text-center py-4">
            <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
            <div className="font-semibold text-white">Maximum Level Reached!</div>
            <div className="text-sm text-gray-300">
              You've achieved the highest bird badge level
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
