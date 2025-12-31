import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ReferralBirdLevel } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

// Task-based thresholds for each level
const TASK_THRESHOLDS: Record<string, number> = {
  'Dove': 0,
  'Sparrow': 5,
  'Hawk': 20,
  'Eagle': 50,
  'Falcon': 100,
  'Phoenix': 500
};

interface BirdProgressIndicatorProps {
  currentBirdLevel: ReferralBirdLevel;
  nextBirdLevel?: ReferralBirdLevel;
  activeReferrals: number;
  tasksCompleted?: number;
  userPoints?: number;
  className?: string;
}

export const BirdProgressIndicator: React.FC<BirdProgressIndicatorProps> = ({
  currentBirdLevel,
  nextBirdLevel,
  activeReferrals,
  tasksCompleted = 0,
  userPoints = 0,
  className = ''
}) => {
  if (!nextBirdLevel) {
    return null;
  }

  // Task-based progress calculation
  const nextTaskThreshold = TASK_THRESHOLDS[nextBirdLevel.name] || nextBirdLevel.min_referrals * 5;
  
  // Tasks are 60% of progress, Points are 40%
  const taskProgress = Math.min((tasksCompleted / nextTaskThreshold) * 100, 100);
  const pointsProgress = Math.min((userPoints / nextBirdLevel.min_points) * 100, 100);
  const progress = (taskProgress * 0.6) + (pointsProgress * 0.4);
  
  const tasksNeeded = Math.max(0, nextTaskThreshold - tasksCompleted);

  const getProgressColor = () => {
    switch (nextBirdLevel.icon) {
      case '🐦':
        return 'bg-amber-500';
      case '🦅':
        return 'bg-blue-500';
      case '🔥':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      default:
        return 'bg-primary';
    }
  };

  const getBenefits = (birdIcon: string) => {
    switch (birdIcon) {
      case '🐦':
        return 'Bonus points on tasks';
      case '🦅':
        return 'Leaderboard visibility & exclusive badges';
      case '🔥':
        return 'Elite status & exclusive Phoenix rewards';
      default:
        return 'Enhanced profile features';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Progress to {nextBirdLevel.name}
        </span>
        <span className="text-xs font-mono">
          {tasksCompleted}/{nextTaskThreshold} tasks
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {tasksNeeded > 0 ? `${tasksNeeded} tasks to unlock` : 'Ready to level up!'}
        </span>
        <Badge variant="outline" className="text-xs">
          {getBenefits(nextBirdLevel.icon)}
        </Badge>
      </div>
    </div>
  );
};
