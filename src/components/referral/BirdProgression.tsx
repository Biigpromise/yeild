
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
    
    const pointsProgress = nextBirdLevel.minPoints > 0 
      ? Math.min(100, (userPoints / nextBirdLevel.minPoints) * 100)
      : 100;
    
    const referralsProgress = nextBirdLevel.minReferrals > 0 
      ? Math.min(100, (activeReferrals / nextBirdLevel.minReferrals) * 100)
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
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Crown className="h-5 w-5 text-primary" />
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
              <p className="text-sm text-muted-foreground">{currentBirdLevel.description}</p>
              
              {/* Current Benefits */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-card-foreground">Your Current Benefits:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {getBirdLevelBenefits(currentBirdLevel).map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-card-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Start your bird progression journey!</p>
          )}
        </CardContent>
      </Card>

      {/* Next Bird Level Progress */}
      {nextBirdLevel && (
        <Card className="border border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
              <Target className="h-5 w-5 text-primary" />
              Next: {nextBirdLevel.emoji} {nextBirdLevel.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground">{nextBirdLevel.description}</p>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-card-foreground">Progress to Next Level</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">Points</span>
                </div>
                <p className="text-lg font-bold text-primary">
                  {userPoints.toLocaleString()}
                </p>
                 <p className="text-xs text-muted-foreground">
                   / {nextBirdLevel.minPoints?.toLocaleString() || 0} needed
                 </p>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium text-card-foreground">Referrals</span>
                </div>
                <p className="text-lg font-bold text-secondary">
                  {activeReferrals}
                </p>
                 <p className="text-xs text-muted-foreground">
                   / {nextBirdLevel.minReferrals || 0} needed
                 </p>
              </div>
            </div>

            {/* Next Level Benefits Preview */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-card-foreground">Unlock These Benefits:</h4>
              <div className="grid grid-cols-1 gap-2">
                {getBirdLevelBenefits(nextBirdLevel).map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!nextBirdLevel && currentBirdLevel && (
        <Card className="border border-border bg-card">
          <CardContent className="text-center py-6">
            <Crown className="h-12 w-12 mx-auto mb-3 text-accent" />
            <h3 className="font-bold text-lg mb-2 text-card-foreground">Maximum Level Achieved!</h3>
            <p className="text-sm text-muted-foreground">
              Congratulations! You've reached the highest bird level. Keep earning to maintain your status!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
