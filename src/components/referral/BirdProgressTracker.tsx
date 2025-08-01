import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Trophy, Crown, Flame } from 'lucide-react';

interface BirdLevel {
  id: number;
  name: string;
  emoji: string;
  icon: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  benefits: string[];
  animation_type: string;
  glow_effect: boolean;
}

interface NextBirdLevel {
  id: number;
  name: string;
  emoji: string;
  icon: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  referrals_needed: number;
  points_needed: number;
}

interface UserStats {
  active_referrals_count: number;
  points: number;
}

interface BirdProgressTrackerProps {
  userId: string;
  showCompactView?: boolean;
  className?: string;
}

export const BirdProgressTracker: React.FC<BirdProgressTrackerProps> = ({
  userId,
  showCompactView = false,
  className = ''
}) => {
  const [currentLevel, setCurrentLevel] = useState<BirdLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<NextBirdLevel | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [allLevels, setAllLevels] = useState<BirdLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllLevels, setShowAllLevels] = useState(false);

  useEffect(() => {
    loadBirdData();
  }, [userId]);

  const loadBirdData = async () => {
    try {
      setLoading(true);
      
      // Get user stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('active_referrals_count, points')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUserStats(profileData);

      // Get current bird level
      const { data: currentLevelData, error: currentLevelError } = await supabase
        .rpc('get_user_bird_level', { user_id_param: userId });

      if (currentLevelError) throw currentLevelError;
      if (currentLevelData && currentLevelData.length > 0) {
        setCurrentLevel(currentLevelData[0]);
      }

      // Get next bird level
      const { data: nextLevelData, error: nextLevelError } = await supabase
        .rpc('get_next_bird_level', { user_id_param: userId });

      if (nextLevelError) throw nextLevelError;
      if (nextLevelData && nextLevelData.length > 0) {
        setNextLevel(nextLevelData[0]);
      }

      // Get all bird levels
      const { data: allLevelsData, error: allLevelsError } = await supabase
        .from('bird_levels')
        .select('*')
        .order('min_referrals', { ascending: true });

      if (allLevelsError) throw allLevelsError;
      setAllLevels(allLevelsData || []);

    } catch (error) {
      console.error('Error loading bird data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentLevel || !userStats) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load bird progression data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressToNext = nextLevel ? 
    Math.min(100, 
      Math.max(
        (userStats.active_referrals_count / nextLevel.min_referrals) * 100,
        (userStats.points / nextLevel.min_points) * 100
      )
    ) : 100;

  const isPhoenix = currentLevel.name === 'Phoenix';

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className={`relative overflow-hidden ${isPhoenix ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' : ''}`}>
        {isPhoenix && (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse"></div>
        )}
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <motion.div 
              className={`text-4xl ${isPhoenix ? 'animate-bounce' : ''}`}
              animate={isPhoenix ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentLevel.emoji}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{currentLevel.name}</h3>
                {isPhoenix && (
                  <div className="flex items-center gap-1">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                )}
                <Badge 
                  variant="secondary" 
                  className={isPhoenix ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800' : ''}
                >
                  Current Level
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{currentLevel.description}</p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{userStats.active_referrals_count}</p>
              <p className="text-sm text-muted-foreground">Active Referrals</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{userStats.points}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && !isPhoenix && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Progress to {nextLevel.name}</p>
                <span className="text-sm text-muted-foreground">{Math.round(progressToNext)}%</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Need {nextLevel.referrals_needed} more referrals</span>
                <span>Need {nextLevel.points_needed} more points</span>
              </div>
            </div>
          )}

          {/* Phoenix Achievement */}
          {isPhoenix && (
            <div className="relative text-center p-6 bg-gradient-to-br from-orange-100 via-red-100 to-yellow-100 rounded-lg border-2 border-orange-300 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse"></div>
              <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute top-1/2 left-2 w-1 h-1 bg-red-400 rounded-full animate-ping delay-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-orange-500" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <Flame className="h-7 w-7 text-red-500" />
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <p className="font-bold text-xl text-orange-800 mb-2">
                    🔥 PHOENIX STATUS ACHIEVED! 🔥
                  </p>
                  <p className="text-base text-orange-700 font-medium mb-2">
                    You've ascended to legendary status!
                  </p>
                  <p className="text-sm text-orange-600">
                    Elite benefits, maximum rewards, and exclusive access unlocked
                  </p>
                </motion.div>
                
                {/* Achievement badges */}
                <div className="flex justify-center gap-2 mt-4">
                  <div className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                    🏆 LEGENDARY
                  </div>
                  <div className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-semibold">
                    🔥 PHOENIX
                  </div>
                  <div className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-semibold">
                    👑 ELITE
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          {currentLevel.benefits && currentLevel.benefits.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Level Benefits:</p>
              <div className="grid gap-1">
                {currentLevel.benefits.slice(0, showCompactView ? 2 : undefined).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View All Levels Button */}
          <Button 
            variant="outline" 
            onClick={() => setShowAllLevels(true)} 
            className="w-full"
            size="sm"
          >
            View All Bird Levels
          </Button>
        </CardContent>
      </Card>

      {/* All Levels Modal */}
      {showAllLevels && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Bird Levels</CardTitle>
                <Button variant="ghost" onClick={() => setShowAllLevels(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="grid gap-4">
                {allLevels.map((level) => {
                  const isCurrentLevel = level.id === currentLevel.id;
                  const isUnlocked = userStats.active_referrals_count >= level.min_referrals && 
                                   userStats.points >= level.min_points;
                  
                  return (
                    <div 
                      key={level.id}
                      className={`p-4 rounded-lg border transition-all ${
                        isCurrentLevel 
                          ? 'border-primary bg-primary/5' 
                          : isUnlocked 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{level.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{level.name}</h4>
                            {isCurrentLevel && <Badge>Current</Badge>}
                            {isUnlocked && !isCurrentLevel && <Badge variant="secondary">Unlocked</Badge>}
                            {level.name === 'Phoenix' && (
                              <div className="flex items-center gap-1">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                <Flame className="h-3 w-3 text-orange-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{level.min_referrals} referrals</span>
                            <span>{level.min_points} points</span>
                          </div>
                        </div>
                      </div>
                      {level.benefits && level.benefits.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {level.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-primary"></div>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};