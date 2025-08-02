
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Target, DollarSign, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { RealisticPhoenixBird } from './RealisticPhoenixBird';
import { RealisticHawkBird } from './RealisticHawkBird';
import { RealisticEagleBird } from './RealisticEagleBird';
import { RealisticFalconBird } from './RealisticFalconBird';

interface BirdLevel {
  id: number;
  name: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  pointsPerTask?: number;
  earningRate?: number;
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

const allBirdLevels: BirdLevel[] = [
  { id: 1, name: 'Dove', emoji: '🕊️', min_referrals: 0, min_points: 0, description: 'Starting your YIELD journey - complete tasks and build connections', color: '#94A3B8', pointsPerTask: 50 },
  { id: 2, name: 'Sparrow', emoji: '🐦', min_referrals: 5, min_points: 0, description: 'Growing your network - connecting brands with quality users', color: '#A78BFA', pointsPerTask: 75 },
  { id: 3, name: 'Hawk', emoji: 'hawk', min_referrals: 20, min_points: 0, description: 'Focused growth - mastering task completion and referral strategy', color: '#8B4513', pointsPerTask: 125 },
  { id: 4, name: 'Eagle', emoji: 'eagle', min_referrals: 50, min_points: 0, description: 'High-performing leader - exclusive access to premium brand campaigns', color: '#DAA520', pointsPerTask: 175 },
  { id: 5, name: 'Falcon', emoji: 'falcon', min_referrals: 100, min_points: 0, description: 'Elite performer - direct brand partnerships and maximum earning potential', color: '#4682B4', pointsPerTask: 225 },
  { id: 6, name: 'Phoenix', emoji: 'phoenix', min_referrals: 500, min_points: 0, description: 'YIELD legend - highest tier with unmatched brand collaboration opportunities', color: '#FF4500', pointsPerTask: 300 },
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
    // If points requirement is 0, only calculate based on referrals
    if (bird.min_points === 0) {
      return Math.min((userStats.referrals / Math.max(1, bird.min_referrals)) * 100, 100);
    }
    
    // Legacy calculation for levels that still require points
    if (userStats.referrals >= bird.min_referrals && userStats.points >= bird.min_points) {
      return 100;
    }
    
    const referralProgress = Math.min((userStats.referrals / bird.min_referrals) * 50, 50);
    const pointsProgress = Math.min((userStats.points / bird.min_points) * 50, 50);
    
    return Math.round(referralProgress + pointsProgress);
  };

  const isUnlocked = (bird: BirdLevel) => {
    // If points requirement is 0, only check referrals
    if (bird.min_points === 0) {
      return userStats.referrals >= bird.min_referrals;
    }
    return userStats.referrals >= bird.min_referrals && userStats.points >= bird.min_points;
  };

  const isCurrent = (bird: BirdLevel) => {
    return currentBird?.id === bird.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yeild-yellow" />
            Bird Progression Journey
          </DialogTitle>
          <p className="text-center text-gray-300">
            Complete tasks and refer friends to unlock new bird levels and increase your earning potential!
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
                    ? 'border-yeild-yellow bg-yeild-yellow/10' 
                    : unlocked 
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 bg-gray-800/50'
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
                      {bird.emoji === 'phoenix' ? (
                        <RealisticPhoenixBird size="sm" animate={current} />
                      ) : bird.emoji === 'hawk' ? (
                        <RealisticHawkBird size="sm" animate={current} />
                      ) : bird.emoji === 'eagle' ? (
                        <RealisticEagleBird size="sm" animate={current} />
                      ) : bird.emoji === 'falcon' ? (
                        <RealisticFalconBird size="sm" animate={current} />
                      ) : (
                        bird.emoji
                      )}
                    </div>
                    {unlocked && (
                      <CheckCircle className="absolute -top-1 -right-1 h-6 w-6 text-green-500 bg-gray-900 rounded-full" />
                    )}
                    {!unlocked && index > currentLevelIndex && (
                      <Lock className="absolute -top-1 -right-1 h-6 w-6 text-gray-400 bg-gray-900 rounded-full p-1" />
                    )}
                  </div>

                  {/* Bird Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold" style={{ color: bird.color }}>
                        {bird.name}
                      </h3>
                      {current && (
                        <Badge className="bg-yeild-yellow text-black">Current</Badge>
                      )}
                      {unlocked && !current && (
                        <Badge className="bg-green-500 text-white">Unlocked</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {bird.description}
                    </p>

                    {/* Requirements and Earning Rate */}
                    <div className="flex flex-wrap gap-4 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-yeild-yellow" />
                        <span>{bird.min_referrals} referrals</span>
                      </div>
                      {bird.min_points > 0 && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-yeild-yellow" />
                          <span>{bird.min_points} points</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-yeild-yellow" />
                        <span className="font-semibold">{bird.pointsPerTask || (bird.earningRate ? bird.earningRate * 10 : 50)} pts/task</span>
                      </div>
                    </div>

                    {/* Progress Bar for locked levels */}
                    {!unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-gray-400">
                          Need: {Math.max(0, bird.min_referrals - userStats.referrals)} more referrals
                          {bird.min_points > 0 && `, ${Math.max(0, bird.min_points - userStats.points)} more points`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h4 className="font-semibold mb-2 text-white">Your Current Stats</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-yeild-yellow">{userStats.referrals}</div>
              <div className="text-gray-400">Referrals</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-yeild-yellow">{userStats.points}</div>
              <div className="text-gray-400">Points</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-yeild-yellow">{userStats.tasksCompleted}</div>
              <div className="text-gray-400">Tasks</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
