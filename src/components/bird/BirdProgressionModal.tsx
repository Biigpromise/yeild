
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface BirdLevel {
  id: number;
  name: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
}

interface BirdProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBird: BirdLevel | null;
  userStats: {
    referrals: number;
    points: number;
    tasksCompleted: number;
  };
}

const allBirdLevels = [
  { id: 1, name: 'Dove', emoji: '🕊️', min_referrals: 0, min_points: 0, description: 'New to the YIELD community', color: '#94A3B8' },
  { id: 2, name: 'Sparrow', emoji: '🐦', min_referrals: 3, min_points: 500, description: 'Getting started with tasks', color: '#A78BFA' },
  { id: 3, name: 'Robin', emoji: '🐦‍⬛', min_referrals: 7, min_points: 1200, description: 'Active community member', color: '#34D399' },
  { id: 4, name: 'Eagle', emoji: '🦅', min_referrals: 15, min_points: 2500, description: 'Skilled task completer', color: '#F59E0B' },
  { id: 5, name: 'Hawk', emoji: '🦅', min_referrals: 25, min_points: 5000, description: 'Expert level achiever', color: '#EF4444' },
  { id: 6, name: 'Falcon', emoji: '🦅', min_referrals: 40, min_points: 8000, description: 'Master of the platform', color: '#8B5CF6' },
  { id: 7, name: 'Phoenix', emoji: '🔥', min_referrals: 60, min_points: 12000, description: 'Legendary YIELD champion', color: '#F97316' },
];

export const BirdProgressionModal: React.FC<BirdProgressionModalProps> = ({
  isOpen,
  onClose,
  currentBird,
  userStats,
}) => {
  const getCurrentLevelIndex = () => {
    if (!currentBird) return 0;
    return allBirdLevels.findIndex(bird => bird.id === currentBird.id);
  };

  const currentLevelIndex = getCurrentLevelIndex();

  const calculateProgress = (bird: BirdLevel) => {
    if (userStats.referrals >= bird.min_referrals && userStats.points >= bird.min_points) {
      return 100;
    }
    
    const referralProgress = Math.min((userStats.referrals / bird.min_referrals) * 50, 50);
    const pointsProgress = Math.min((userStats.points / bird.min_points) * 50, 50);
    
    return Math.round(referralProgress + pointsProgress);
  };

  const isUnlocked = (bird: BirdLevel) => {
    return userStats.referrals >= bird.min_referrals && userStats.points >= bird.min_points;
  };

  const isCurrent = (bird: BirdLevel) => {
    return currentBird?.id === bird.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Bird Progression Journey
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Complete tasks and refer friends to unlock new bird levels!
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {allBirdLevels.map((bird, index) => {
            const progress = calculateProgress(bird);
            const unlocked = isUnlocked(bird);
            const current = isCurrent(bird);
            
            return (
              <motion.div
                key={bird.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  current 
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : unlocked 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Bird Icon */}
                  <div className="relative">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2"
                      style={{ 
                        backgroundColor: bird.color + '20',
                        borderColor: bird.color 
                      }}
                    >
                      {bird.emoji}
                    </div>
                    {unlocked && (
                      <CheckCircle className="absolute -top-1 -right-1 h-6 w-6 text-green-500 bg-white rounded-full" />
                    )}
                    {!unlocked && index > currentLevelIndex && (
                      <Lock className="absolute -top-1 -right-1 h-6 w-6 text-gray-400 bg-white rounded-full p-1" />
                    )}
                  </div>

                  {/* Bird Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold" style={{ color: bird.color }}>
                        {bird.name}
                      </h3>
                      {current && (
                        <Badge className="bg-yellow-500 text-white">Current</Badge>
                      )}
                      {unlocked && !current && (
                        <Badge className="bg-green-500 text-white">Unlocked</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {bird.description}
                    </p>

                    {/* Requirements */}
                    <div className="flex flex-wrap gap-4 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{bird.min_referrals} referrals</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{bird.min_points} points</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {!unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Need: {Math.max(0, bird.min_referrals - userStats.referrals)} more referrals, {' '}
                          {Math.max(0, bird.min_points - userStats.points)} more points
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <h4 className="font-semibold mb-2">Your Current Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg">{userStats.referrals}</div>
              <div className="text-muted-foreground">Referrals</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{userStats.points}</div>
              <div className="text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{userStats.tasksCompleted}</div>
              <div className="text-muted-foreground">Tasks</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
