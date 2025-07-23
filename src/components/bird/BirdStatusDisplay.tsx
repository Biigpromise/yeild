
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Crown, Users, Trophy, Target, Zap, Eye, AlertCircle } from 'lucide-react';
import { useBirdLevel } from '@/hooks/useBirdLevel';
import { BirdProgressionModal } from './BirdProgressionModal';

export const BirdStatusDisplay: React.FC = () => {
  const { currentBird, nextBird, userStats, loading, error } = useBirdLevel();
  const [showProgression, setShowProgression] = useState(false);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-16 bg-gray-700 rounded-full w-16 mx-auto"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-red-400 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default bird for new users
  const defaultBird = {
    id: 1,
    name: 'Hatchling',
    emoji: '🐣',
    color: '#10B981',
    min_referrals: 0,
    min_points: 0,
    description: 'Welcome to Yield! Start completing tasks to grow.',
    benefits: ['Access to basic tasks', 'Point earning'],
    animation_type: 'static' as const,
    glow_effect: false,
    earningRate: 1.0,
    icon: 'hatchling'
  };

  const displayBird = currentBird || defaultBird;

  // Calculate progress to next level
  const progressToNext = nextBird ? Math.min(100, 
    Math.max(
      (userStats.referrals / Math.max(1, nextBird.min_referrals - displayBird.min_referrals)) * 50,
      (userStats.points / Math.max(1, nextBird.min_points - displayBird.min_points)) * 50
    )
  ) : 100;

  return (
    <>
      <div className="w-full max-w-md mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          data-onboarding="bird-status"
        >
          <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border-purple-500/30 shadow-xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Your Bird Status</h3>
                  <p className="text-gray-300 text-xs">Level up by completing tasks!</p>
                </div>
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>

              {/* Current Bird Display */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  className="relative mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-purple-500/50 ${displayBird.glow_effect ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: displayBird.color + '20' }}
                  >
                    {displayBird.emoji}
                  </div>
                  {displayBird.glow_effect && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>

                <Badge 
                  className="text-white mb-3 px-4 py-1 text-sm font-semibold"
                  style={{ backgroundColor: displayBird.color }}
                >
                  {displayBird.name}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgression(true)}
                  className="text-xs flex items-center gap-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
                >
                  <Eye className="h-3 w-3" />
                  View All Birds
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <Users className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-bold text-white">{userStats.referrals}</div>
                  <div className="text-xs text-gray-400">Referrals</div>
                </div>
                
                <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <Target className="h-4 w-4 mx-auto mb-1 text-green-400" />
                  <div className="text-lg font-bold text-white">{userStats.tasksCompleted}</div>
                  <div className="text-xs text-gray-400">Tasks</div>
                </div>
                
                <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                  <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
                  <div className="text-lg font-bold text-white">{userStats.points}</div>
                  <div className="text-xs text-gray-400">Points</div>
                </div>
              </div>

              {/* Progress to Next Level */}
              {nextBird && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Next: {nextBird.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {Math.round(progressToNext)}%
                    </span>
                  </div>
                  
                  <Progress value={progressToNext} className="h-2 bg-gray-700" />
                  
                  <div className="text-xs text-gray-400 text-center">
                    Need: {Math.max(0, nextBird.min_referrals - userStats.referrals)} referrals, {' '}
                    {Math.max(0, nextBird.min_points - userStats.points)} points
                  </div>
                </div>
              )}

              {!nextBird && (
                <div className="text-center py-3">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm text-yellow-500 font-semibold">Max Level Reached!</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {displayBird && (
        <BirdProgressionModal
          isOpen={showProgression}
          onClose={() => setShowProgression(false)}
          currentBird={displayBird}
          userStats={userStats}
        />
      )}
    </>
  );
};
