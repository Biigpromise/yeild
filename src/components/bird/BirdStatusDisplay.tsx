
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Users, Trophy, Target, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedBirdBadge } from '@/components/referral/EnhancedBirdBadge';

export const BirdStatusDisplay: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Mock data for demonstration - in real app, this would come from user profile
  const mockUserData = {
    currentBird: {
      name: "Dove YEILDER",
      emoji: "🕊️",
      color: "#8B5CF6",
      level: 1
    },
    nextBird: {
      name: "Hawk YEILDER", 
      emoji: "🦅",
      color: "#3B82F6",
      level: 2,
      requiresReferrals: 3,
      requiresTasks: 5
    },
    stats: {
      referrals: 1,
      tasksCompleted: 2,
      points: 150
    }
  };

  const progressToNext = Math.min(100, 
    (mockUserData.stats.referrals / mockUserData.nextBird.requiresReferrals) * 50 + 
    (mockUserData.stats.tasksCompleted / mockUserData.nextBird.requiresTasks) * 50
  );

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
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-purple-500/50"
                style={{ backgroundColor: mockUserData.currentBird.color + '20' }}
              >
                {mockUserData.currentBird.emoji}
              </div>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>

          {/* Current Status */}
          <div className="text-center mb-6">
            <Badge 
              className="text-white mb-2 px-4 py-1"
              style={{ backgroundColor: mockUserData.currentBird.color }}
            >
              {mockUserData.currentBird.name}
            </Badge>
            <p className="text-sm text-gray-400">Level {mockUserData.currentBird.level}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <Users className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <div className="text-lg font-bold text-white">{mockUserData.stats.referrals}</div>
              <div className="text-xs text-gray-400">Referrals</div>
            </div>
            
            <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
              <Target className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <div className="text-lg font-bold text-white">{mockUserData.stats.tasksCompleted}</div>
              <div className="text-xs text-gray-400">Tasks</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <Zap className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-bold text-white">{mockUserData.stats.points}</div>
              <div className="text-xs text-gray-400">Points</div>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Next: {mockUserData.nextBird.name}
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(progressToNext)}%
              </span>
            </div>
            
            <Progress value={progressToNext} className="h-3 bg-gray-700" />
            
            <div className="text-xs text-gray-400 space-y-1">
              <div>Need: {mockUserData.nextBird.requiresReferrals - mockUserData.stats.referrals} more referrals</div>
              <div>Need: {mockUserData.nextBird.requiresTasks - mockUserData.stats.tasksCompleted} more tasks</div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{mockUserData.nextBird.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Ready to level up?</p>
                <p className="text-xs text-gray-400">Complete more tasks and refer friends!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
