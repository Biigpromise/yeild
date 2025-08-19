import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, TrendingUp } from 'lucide-react';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  min_referrals: number;
  min_points: number;
  description: string;
  benefits: string[];
}

interface BirdProgressionProps {
  userPoints: number;
  activeReferrals: number;
  currentBirdLevel: BirdLevel | null;
  nextBirdLevel?: BirdLevel | null;
}

export const BirdProgression: React.FC<BirdProgressionProps> = ({
  userPoints,
  activeReferrals,
  currentBirdLevel,
  nextBirdLevel
}) => {
  const getProgressPercentage = () => {
    if (!nextBirdLevel) return 100;
    
    const referralProgress = Math.min(
      (activeReferrals / nextBirdLevel.min_referrals) * 100,
      100
    );
    const pointsProgress = Math.min(
      (userPoints / nextBirdLevel.min_points) * 100,
      100
    );
    
    return Math.min(referralProgress, pointsProgress);
  };

  const getReferralsNeeded = () => {
    if (!nextBirdLevel) return 0;
    return Math.max(0, nextBirdLevel.min_referrals - activeReferrals);
  };

  const getPointsNeeded = () => {
    if (!nextBirdLevel) return 0;
    return Math.max(0, nextBirdLevel.min_points - userPoints);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Bird Level Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Current Level */}
        <div className="text-center space-y-2">
          <div className="text-6xl">{currentBirdLevel?.icon || '🕊️'}</div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: currentBirdLevel?.color }}>
              {currentBirdLevel?.name || 'Dove'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentBirdLevel?.description || 'Starting your journey'}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Current Level
          </Badge>
        </div>

        {/* Progress to Next Level */}
        {nextBirdLevel ? (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-lg">Next Level: {nextBirdLevel.name}</h4>
              <p className="text-sm text-muted-foreground">{nextBirdLevel.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to {nextBirdLevel.name}</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">Referrals</span>
                  </div>
                  <div className="text-lg font-bold">{activeReferrals}</div>
                  <div className="text-xs text-muted-foreground">
                    {getReferralsNeeded() > 0 ? `${getReferralsNeeded()} more needed` : 'Complete!'}
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Points</span>
                  </div>
                  <div className="text-lg font-bold">{userPoints}</div>
                  <div className="text-xs text-muted-foreground">
                    {getPointsNeeded() > 0 ? `${getPointsNeeded()} more needed` : 'Complete!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Level Preview */}
            <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg">
              <div className="text-4xl mb-2">{nextBirdLevel.icon}</div>
              <div className="text-lg font-medium" style={{ color: nextBirdLevel.color }}>
                {nextBirdLevel.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Unlock at {nextBirdLevel.min_referrals} referrals & {nextBirdLevel.min_points} points
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="text-4xl">🏆</div>
            <h4 className="font-medium text-lg">Maximum Level Reached!</h4>
            <p className="text-sm text-muted-foreground">
              Congratulations! You've achieved the highest bird level.
            </p>
          </div>
        )}

        {/* Current Benefits */}
        {currentBirdLevel?.benefits && currentBirdLevel.benefits.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Current Benefits:</h5>
            <div className="flex flex-wrap gap-1">
              {currentBirdLevel.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};