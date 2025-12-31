import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Target, TrendingUp, Zap, Users } from 'lucide-react';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  color: string;
  min_referrals: number;
  min_points: number;
  min_tasks?: number; // New: task-based requirement
  description: string;
  benefits: string[];
}

interface BirdProgressionProps {
  userPoints: number;
  activeReferrals: number;
  tasksCompleted?: number; // New: tasks completed count
  currentBirdLevel: BirdLevel | null;
  nextBirdLevel?: BirdLevel | null;
}

// Task-based thresholds for each level
const TASK_THRESHOLDS: Record<string, number> = {
  'Dove': 0,
  'Sparrow': 5,
  'Hawk': 20,
  'Eagle': 50,
  'Falcon': 100,
  'Phoenix': 500
};

export const BirdProgression: React.FC<BirdProgressionProps> = ({
  userPoints,
  activeReferrals,
  tasksCompleted = 0,
  currentBirdLevel,
  nextBirdLevel
}) => {
  // New: Calculate progress based on tasks (primary) and points (secondary)
  // Referrals now provide a bonus but aren't required
  const getProgressPercentage = () => {
    if (!nextBirdLevel) return 100;
    
    const nextTaskThreshold = TASK_THRESHOLDS[nextBirdLevel.name] || nextBirdLevel.min_referrals * 5;
    
    // Tasks are 60% of progress, Points are 40%
    const taskProgress = Math.min((tasksCompleted / nextTaskThreshold) * 100, 100);
    const pointsProgress = Math.min((userPoints / nextBirdLevel.min_points) * 100, 100);
    
    // Weighted average: 60% tasks, 40% points
    return (taskProgress * 0.6) + (pointsProgress * 0.4);
  };

  const getTasksNeeded = () => {
    if (!nextBirdLevel) return 0;
    const nextTaskThreshold = TASK_THRESHOLDS[nextBirdLevel.name] || nextBirdLevel.min_referrals * 5;
    return Math.max(0, nextTaskThreshold - tasksCompleted);
  };

  const getPointsNeeded = () => {
    if (!nextBirdLevel) return 0;
    return Math.max(0, nextBirdLevel.min_points - userPoints);
  };

  // Referrals provide bonus speed but aren't required
  const getReferralBonus = () => {
    if (activeReferrals === 0) return null;
    const bonusPercent = Math.min(activeReferrals * 5, 50); // Up to 50% bonus
    return bonusPercent;
  };

  const referralBonus = getReferralBonus();

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

              {/* Referral Bonus Indicator */}
              {referralBonus && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-500/10 rounded-lg p-2">
                  <Users className="h-4 w-4" />
                  <span>+{referralBonus}% speed bonus from {activeReferrals} referrals!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Tasks - Primary metric */}
                <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tasks</span>
                  </div>
                  <div className="text-lg font-bold text-primary">{tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground">
                    {getTasksNeeded() > 0 ? `${getTasksNeeded()} more needed` : 'Complete!'}
                  </div>
                </div>

                {/* Points - Secondary metric */}
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

              {/* How progression works */}
              <div className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg p-2">
                <span className="font-medium">How it works:</span> Complete tasks (60%) + Earn points (40%). Referrals give bonus speed!
              </div>
            </div>

            {/* Next Level Preview */}
            <div className="text-center p-4 border-2 border-dashed border-muted rounded-lg">
              <div className="text-4xl mb-2">{nextBirdLevel.icon}</div>
              <div className="text-lg font-medium" style={{ color: nextBirdLevel.color }}>
                {nextBirdLevel.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Unlock at {TASK_THRESHOLDS[nextBirdLevel.name] || nextBirdLevel.min_referrals * 5} tasks & {nextBirdLevel.min_points} points
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