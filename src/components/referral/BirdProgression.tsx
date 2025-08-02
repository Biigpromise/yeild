
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
    
    // Calculate progress based on what's needed for the next level
    const referralProgress = nextBirdLevel.min_referrals > 0 
      ? (activeReferrals / nextBirdLevel.min_referrals) * 100 
      : 100;
    
    const pointsProgress = nextBirdLevel.min_points > 0 
      ? (userPoints / nextBirdLevel.min_points) * 100 
      : 100;
    
    // For levels with both requirements, take the minimum progress
    // For levels with only one requirement, return that requirement's progress
    if (nextBirdLevel.min_points > 0 && nextBirdLevel.min_referrals > 0) {
      return Math.min(referralProgress, pointsProgress);
    } else if (nextBirdLevel.min_referrals > 0) {
      return referralProgress;
    } else if (nextBirdLevel.min_points > 0) {
      return pointsProgress;
    }
    
    return 0;
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
                  backgroundColor: nextBirdLevel.color + '20' || '#3B82F620',
                  borderColor: nextBirdLevel.color || '#3B82F6'
                }}
              >
                <span className="text-2xl">{nextBirdLevel.emoji || '🐦'}</span>
              </div>
            </div>
          )}
        </div>

        {nextBirdLevel && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-white">
                <span>Progress to {nextBirdLevel.name}</span>
                <span className="font-medium">{calculateProgress().toFixed(1)}%</span>
              </div>
            <Progress value={calculateProgress()} className="h-2" />
            
            {/* Encouragement Message */}
            <div className="text-center p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
              <p className="text-sm text-blue-300 font-medium">
                {calculateProgress() < 100 
                  ? `You're ${(100 - calculateProgress()).toFixed(1)}% away from ${nextBirdLevel.name}! Keep going! 🚀`
                  : `Congratulations! You've reached ${nextBirdLevel.name} level! 🎉`
                }
              </p>
            </div>
            
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
