
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Crown, Users, Target } from 'lucide-react';

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
  const calculateProgress = () => {
    if (!nextBirdLevel) return 100;
    
    const pointsProgress = nextBirdLevel.min_points > 0 
      ? Math.min(100, (userPoints / nextBirdLevel.min_points) * 100)
      : 100;
    
    const referralsProgress = nextBirdLevel.min_referrals > 0 
      ? Math.min(100, (activeReferrals / nextBirdLevel.min_referrals) * 100)
      : 100;
    
    // Both requirements must be met, so take the minimum
    return Math.min(pointsProgress, referralsProgress);
  };

  const getBirdLevelBenefits = (birdLevel: any) => {
    if (!birdLevel?.benefits) return [];
    return birdLevel.benefits;
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-4">
      {/* Current Bird Level */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Current Bird Level
            </CardTitle>
            {currentBirdLevel && (
              <Badge 
                variant="secondary" 
                className="text-lg px-3 py-1"
                style={{ backgroundColor: currentBirdLevel.color + '20', color: currentBirdLevel.color }}
              >
                {currentBirdLevel.emoji} {currentBirdLevel.name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {currentBirdLevel ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{currentBirdLevel.description}</p>
              
              {/* Current Benefits */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Your Current Benefits:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {getBirdLevelBenefits(currentBirdLevel).map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-3 w-3 text-purple-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Start your bird progression journey!</p>
          )}
        </CardContent>
      </Card>

      {/* Next Bird Level Progress */}
      {nextBirdLevel && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Next: {nextBirdLevel.emoji} {nextBirdLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-gray-600">{nextBirdLevel.description}</p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress to Next Level</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Points</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {userPoints.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  / {nextBirdLevel.min_points?.toLocaleString() || 0} needed
                </p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Referrals</span>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {activeReferrals}
                </p>
                <p className="text-xs text-gray-500">
                  / {nextBirdLevel.min_referrals} needed
                </p>
              </div>
            </div>

            {/* Next Level Benefits Preview */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Unlock These Benefits:</h4>
              <div className="grid grid-cols-1 gap-2">
                {getBirdLevelBenefits(nextBirdLevel).map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-3 w-3 text-yellow-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!nextBirdLevel && currentBirdLevel && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="text-center py-6">
            <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
            <h3 className="font-bold text-lg mb-2">Maximum Level Achieved!</h3>
            <p className="text-sm text-gray-600">
              Congratulations! You've reached the highest bird level. Keep earning to maintain your status!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
