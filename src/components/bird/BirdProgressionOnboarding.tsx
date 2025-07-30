
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, DollarSign, Users, Target, ChevronRight, SkipForward } from 'lucide-react';
import { RealisticPhoenixBird } from './RealisticPhoenixBird';
import { RealisticHawkBird } from './RealisticHawkBird';
import { RealisticEagleBird } from './RealisticEagleBird';
import { RealisticFalconBird } from './RealisticFalconBird';

interface BirdLevel {
  name: string;
  emoji: string;
  minReferrals: number;
  minPoints: number;
  pointsPerTask: number;
  description: string;
  color: string;
}

const birdLevels: BirdLevel[] = [
  { name: 'Dove', emoji: '🕊️', minReferrals: 0, minPoints: 0, pointsPerTask: 50, description: 'Starting your journey', color: '#94A3B8' },
  { name: 'Sparrow', emoji: '🐦', minReferrals: 5, minPoints: 0, pointsPerTask: 75, description: 'Building momentum', color: '#A78BFA' },
  { name: 'Hawk', emoji: 'hawk', minReferrals: 20, minPoints: 0, pointsPerTask: 125, description: 'Sharp focus and strategic growth', color: '#8B4513' },
  { name: 'Eagle', emoji: 'eagle', minReferrals: 50, minPoints: 0, pointsPerTask: 175, description: 'Soaring high with impressive achievements', color: '#DAA520' },
  { name: 'Falcon', emoji: 'falcon', minReferrals: 100, minPoints: 0, pointsPerTask: 225, description: 'Lightning-fast growth and precision', color: '#4682B4' },
  { name: 'Phoenix', emoji: 'phoenix', minReferrals: 500, minPoints: 0, pointsPerTask: 300, description: 'Legendary status - risen from the ashes', color: '#FF4500' },
];

interface BirdProgressionOnboardingProps {
  onComplete?: () => void;
}

export const BirdProgressionOnboarding: React.FC<BirdProgressionOnboardingProps> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <RealisticPhoenixBird size="xl" animate={true} />
        </div>
        <h2 className="text-3xl font-bold text-white">Unlock Your Earning Potential</h2>
        <p className="text-gray-300 text-lg">
          Progress through bird levels to increase your task earnings and unlock exclusive benefits
        </p>
      </div>

      <div className="grid gap-4">
        {birdLevels.map((level, index) => (
          <Card key={level.name} className="bg-gray-800 border-gray-700 relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: level.color }}
            />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: level.color + '20', border: `2px solid ${level.color}` }}
                  >
                    {level.emoji === 'phoenix' ? (
                      <RealisticPhoenixBird size="sm" animate={false} />
                    ) : level.emoji === 'hawk' ? (
                      <RealisticHawkBird size="sm" animate={false} />
                    ) : level.emoji === 'eagle' ? (
                      <RealisticEagleBird size="sm" animate={false} />
                    ) : level.emoji === 'falcon' ? (
                      <RealisticFalconBird size="sm" animate={false} />
                    ) : (
                      level.emoji
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white">{level.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{level.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="text-white" style={{ backgroundColor: level.color }}>
                    {level.pointsPerTask} pts/task
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Referrals Required</p>
                    <p className="text-white font-semibold">{level.minReferrals}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Points Required</p>
                    <p className="text-white font-semibold">{level.minPoints}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Points Per Task</p>
                    <p className="text-white font-semibold">{level.pointsPerTask} points</p>
                  </div>
                </div>
              </div>
              
              {level.name === 'Phoenix' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yeild-yellow" />
                    <span className="text-white font-semibold">Phoenix Benefits</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Highest earning rate: 300 points per task</li>
                    <li>• Exclusive Phoenix rewards and badges</li>
                    <li>• Priority support and early access</li>
                    <li>• Special recognition on leaderboards</li>
                    <li>• Elite status and legendary recognition</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-6">
        <div>
          <p className="text-gray-400">
            Start as a Dove and work your way up to Phoenix status!
          </p>
          <p className="text-yeild-yellow font-semibold mt-2">
            Complete tasks and refer friends to unlock higher earning potential
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onComplete}
            className="flex items-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Skip for now
          </Button>
          <Button
            onClick={onComplete}
            className="flex items-center gap-2"
          >
            Continue to Dashboard
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
