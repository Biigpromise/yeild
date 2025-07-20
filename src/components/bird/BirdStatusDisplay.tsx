
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Crown, Users, Trophy, Target, Zap, Eye } from 'lucide-react';
import { useBirdLevel } from '@/hooks/useBirdLevel';
import { BirdProgressionModal } from './BirdProgressionModal';

export const BirdStatusDisplay: React.FC = () => {
  const { currentBird, nextBird, userStats, loading } = useBirdLevel();
  const [showProgression, setShowProgression] = useState(false);

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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        data-onboarding="bird-status"
      >
        <Card className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 border-purple-500/30 shadow-xl overflow-hidden">
          <CardContent className="p-4">
            {/* Simplified Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Your Bird Status</h3>
                <p className="text-gray-300 text-xs">Level up by completing tasks!</p>
              </div>
              <Crown className="h-6 w-6 text-yellow-500" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Current Bird Display */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative mb-3"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-purple-500/50 ${currentBird.glow_effect ? 'animate-pulse' : ''}`}
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

                <Badge 
                  className="text-white mb-2 px-3 py-1 text-sm"
                  style={{ backgroundColor: currentBird.color }}
                >
                  {currentBird.name}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProgression(true)}
                  className="text-xs flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View All Birds
                </Button>
              </div>

              {/* Stats and Progress */}
              <div className="space-y-3">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <Users className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-sm font-bold text-white">{userStats.referrals}</div>
                    <div className="text-xs text-gray-400">Referrals</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-900/20 rounded-lg border border-green-500/30">
                    <Target className="h-4 w-4 mx-auto mb-1 text-green-400" />
                    <div className="text-sm font-bold text-white">{userStats.tasksCompleted}</div>
                    <div className="text-xs text-gray-400">Tasks</div>
                  </div>
                  
                  <div className="text-center p-2 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                    <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
                    <div className="text-sm font-bold text-white">{userStats.points}</div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>
                </div>

                {/* Progress to Next Level */}
                {nextBird && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        Next: {nextBird.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {Math.round(progressToNext)}%
                      </span>
                    </div>
                    
                    <Progress value={progressToNext} className="h-2 bg-gray-700" />
                    
                    <div className="text-xs text-gray-400">
                      Need: {Math.max(0, nextBird.min_referrals - userStats.referrals)} referrals, {' '}
                      {Math.max(0, nextBird.min_points - userStats.points)} points
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <BirdProgressionModal
        isOpen={showProgression}
        onClose={() => setShowProgression(false)}
        currentBird={currentBird}
        userStats={userStats}
      />
    </>
  );
};
