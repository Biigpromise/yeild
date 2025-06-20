
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock } from 'lucide-react';
import { BIRD_LEVELS, ReferralBirdLevel } from '@/services/userService';
import { BirdBadge } from './BirdBadge';

interface BirdProgressionProps {
  userPoints: number;
  activeReferrals: number;
  currentBirdLevel: ReferralBirdLevel;
  nextBirdLevel?: ReferralBirdLevel;
}

export const BirdProgression: React.FC<BirdProgressionProps> = ({
  userPoints,
  activeReferrals,
  currentBirdLevel,
  nextBirdLevel
}) => {
  const getBirdStatus = (level: ReferralBirdLevel) => {
    const hasEnoughReferrals = activeReferrals >= level.minReferrals;
    const hasEnoughPoints = userPoints >= level.minPoints;
    
    if (hasEnoughReferrals && hasEnoughPoints) {
      return 'owned';
    } else if (level.name === currentBirdLevel.name) {
      return 'active';
    } else {
      return 'locked';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'owned':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'owned':
        return 'Owned';
      case 'active':
        return 'Active';
      case 'locked':
        return 'Locked';
      default:
        return 'Pending';
    }
  };

  const progressToNext = nextBirdLevel 
    ? Math.min(100, (userPoints / nextBirdLevel.minPoints) * 100)
    : 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Bird Progression</CardTitle>
        {nextBirdLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{userPoints} / {nextBirdLevel.minPoints} pts to unlock {nextBirdLevel.name}</span>
              <span>{activeReferrals} / {nextBirdLevel.minReferrals} referrals</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {BIRD_LEVELS.map((level) => {
            const status = getBirdStatus(level);
            const isActive = level.name === currentBirdLevel.name;
            
            return (
              <div 
                key={level.name}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all
                  ${status === 'owned' ? 'border-green-300 bg-green-50' : 
                    isActive ? 'border-blue-300 bg-blue-50' : 
                    'border-gray-200 bg-gray-50'}
                  ${isActive ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                `}
              >
                <div className="flex justify-center mb-2">
                  <BirdBadge birdLevel={level} size="lg" />
                </div>
                
                <h4 className="font-semibold text-sm mb-1">{level.name}</h4>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{level.minPoints}+ pts</p>
                  <p>{level.minReferrals}+ referrals</p>
                </div>
                
                <div className="mt-2 flex items-center justify-center gap-1">
                  {getStatusIcon(status)}
                  <span className={`text-xs font-medium ${
                    status === 'owned' ? 'text-green-600' :
                    status === 'active' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex gap-2 justify-center">
          <Button variant="outline" size="sm">
            Unlock Next Bird
          </Button>
          <Button variant="ghost" size="sm">
            View All Birds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
