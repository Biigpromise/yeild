
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Users, Trophy, Target, Zap } from 'lucide-react';
import { useBirdLevel } from '@/hooks/useBirdLevel';

export const BirdStatusDisplay: React.FC = () => {
  const { currentBird, nextBird, userStats, loading } = useBirdLevel();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border-purple-500/30 shadow-xl">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            <div className="h-24 bg-gray-700 rounded-full w-24 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentBird) {
    return null;
  }

  // Calculate progress to next level
  const progressToNext = nextBird ? Math.min(100, 
    (userStats.referrals / (nextBird.min_referrals - currentBird.min_referrals)) * 50 + 
    (userStats.points / (nextBird.min_points - currentBird.min_points)) * 50
  ) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border-purple-500/30 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Your Bird Status</h3>
              <p className="text-gray-300 text-sm">Earn rewards and level up your YEILDER bird</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>

          {/* Current Bird Display */}
          <div className="flex items-center justify-center mb-8">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-purple-500/50 ${currentBird.glow_effect ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: currentBird.color + '20' }}
              >
                {currentBird.emoji}
              </div>
              {currentBird.glow_effect && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </div>

          {/* Current Status */}
          <div className="text-center mb-6">
            <Badge 
              className="text-white mb-2 px-4 py-1"
              style={{ backgroundColor: currentBird.color }}
            >
              {currentBird.name}
            </Badge>
            <p className="text-sm text-gray-400">{currentBird.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <Users className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <div className="text-lg font-bold text-white">{userStats.referrals}</div>
              <div className="text-xs text-gray-400">Referrals</div>
            </div>
            
            <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              <Target className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <div className="text-lg font-bold text-white">{userStats.tasksCompleted}</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-bold text-white">{userStats.points}</div>
              <div className="text-xs text-gray-400">Points</div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextBird && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Next: {nextBird.name}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(progressToNext)}%
                </span>
              </div>
              
              <Progress value={progressToNext} className="h-3 bg-gray-700" />
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>Need: {Math.max(0, nextBird.min_referrals - userStats.referrals)} more referrals</div>
                <div>Need: {Math.max(0, nextBird.min_points - userStats.points)} more points</div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          {nextBird && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{nextBird.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Ready to level up?</p>
                  <p className="text-xs text-gray-400">Complete more tasks and refer friends!</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
