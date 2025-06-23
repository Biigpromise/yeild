
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Clock, Crown, Star, Zap } from 'lucide-react';
import { BIRD_LEVELS, ReferralBirdLevel } from '@/services/userService';
import { BirdBadge } from './BirdBadge';
import { BirdProgressIndicator } from './BirdProgressIndicator';

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
        return 'Current';
      case 'locked':
        return 'Locked';
      default:
        return 'Pending';
    }
  };

  const getBirdBenefits = (birdIcon: string) => {
    switch (birdIcon) {
      case 'dove':
        return 'Basic profile features';
      case 'hawk':
        return 'Premium task access';
      case 'eagle':
        return 'Leaderboard visibility & badges';
      case 'falcon':
        return 'Special rank & early task access';
      case 'phoenix':
        return 'Elite status & exclusive rewards';
      default:
        return 'Standard features';
    }
  };

  const getProgressToNext = (level: ReferralBirdLevel) => {
    if (activeReferrals >= level.minReferrals) return 100;
    return Math.min(100, (activeReferrals / level.minReferrals) * 100);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
          <Crown className="h-5 w-5 text-yellow-600" />
          Bird Progression System
        </CardTitle>
        {nextBirdLevel && (
          <BirdProgressIndicator
            currentBirdLevel={currentBirdLevel}
            nextBirdLevel={nextBirdLevel}
            activeReferrals={activeReferrals}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {BIRD_LEVELS.slice(1).map((level) => {
            const status = getBirdStatus(level);
            const isActive = level.name === currentBirdLevel.name;
            const progress = getProgressToNext(level);
            const referralsNeeded = Math.max(0, level.minReferrals - activeReferrals);
            
            return (
              <div 
                key={level.name}
                className={`
                  p-4 rounded-lg border-2 text-center transition-all hover:scale-105
                  ${status === 'owned' ? 'border-green-300 bg-green-50' : 
                    isActive ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-400 ring-opacity-50' : 
                    'border-gray-200 bg-gray-50 hover:border-gray-300'}
                  ${level.icon === 'phoenix' ? 'bg-gradient-to-br from-red-50 to-orange-50 border-orange-300' : ''}
                `}
              >
                <div className="flex justify-center mb-3">
                  <BirdBadge 
                    birdLevel={level} 
                    activeReferrals={activeReferrals}
                    size="lg" 
                  />
                </div>
                
                <h4 className="font-semibold text-sm mb-2 text-black">{level.name}</h4>
                
                <div className="space-y-2 text-xs text-black mb-3">
                  <p className="font-mono text-black">{level.minReferrals}+ referrals</p>
                  <Badge variant="outline" className="text-xs px-2 py-1 text-black border-black">
                    {getBirdBenefits(level.icon)}
                  </Badge>
                </div>

                {/* Progress Bar for locked levels */}
                {status === 'locked' && (
                  <div className="space-y-1 mb-3">
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-xs text-black">
                      {referralsNeeded} more needed
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-1">
                  {getStatusIcon(status)}
                  <span className={`text-xs font-medium ${
                    status === 'owned' ? 'text-green-600' :
                    status === 'active' ? 'text-blue-600' :
                    'text-black'
                  }`}>
                    {getStatusText(status)}
                  </span>
                </div>

                {/* Special indicators for animated birds */}
                {(level.icon === 'eagle' || level.icon === 'falcon' || level.icon === 'phoenix') && status !== 'locked' && (
                  <div className="mt-2 flex justify-center">
                    <Badge variant="secondary" className="text-xs text-black">
                      {level.icon === 'phoenix' ? '🔥 Animated' : 
                       level.icon === 'falcon' ? '⚡ Enhanced' : 
                       '✨ Special'}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex gap-2 justify-center">
          <Button variant="outline" size="sm" className="flex items-center gap-2 text-black border-black hover:bg-gray-100">
            <Star className="h-4 w-4" />
            View Leaderboard
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-black hover:bg-gray-100">
            <Zap className="h-4 w-4" />
            Referral Guide
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
