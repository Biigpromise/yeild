import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedBirdBadge } from './EnhancedBirdBadge';
import { Trophy, Target, Zap } from 'lucide-react';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  benefits: string[];
}

interface NextBirdLevel extends BirdLevel {
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

  useEffect(() => {
    loadProgressData();
  }, [userId]);

  const loadProgressData = async () => {
    try {
      // Get user stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('active_referrals_count, points')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setUserStats(profileData);

      // Get current bird level
      const { data: currentLevelData, error: currentError } = await supabase
        .rpc('get_user_bird_level', { user_id_param: userId });

      if (currentError) throw currentError;
      if (currentLevelData && currentLevelData.length > 0) {
        setCurrentLevel(currentLevelData[0]);
      }

      // Get next bird level
      const { data: nextLevelData, error: nextError } = await supabase
        .rpc('get_next_bird_level', { user_id_param: userId });

      if (nextError) throw nextError;
      if (nextLevelData && nextLevelData.length > 0) {
        const nextData = nextLevelData[0] as any;
        setNextLevel({
          ...nextData,
          benefits: nextData.benefits || [],
          animation_type: nextData.animation_type || 'static',
          glow_effect: nextData.glow_effect || false
        });
      }

      // Get all bird levels for milestone display
      const { data: levelsData, error: levelsError } = await supabase
        .from('bird_levels')
        .select('*')
        .order('min_referrals', { ascending: true });

      if (levelsError) throw levelsError;
      setAllLevels(levelsData || []);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!currentLevel || !userStats) {
    return null;
  }

  const calculateProgress = () => {
    if (!nextLevel) return 100; // Max level reached
    
    // Since we removed point requirements (min_points = 0), only calculate based on referrals
    if (nextLevel.min_points === 0) {
      return Math.min((userStats.active_referrals_count / nextLevel.min_referrals) * 100, 100);
    }
    
    // Legacy calculation for levels that still require points
    const referralProgress = userStats.active_referrals_count / nextLevel.min_referrals * 100;
    const pointsProgress = userStats.points / nextLevel.min_points * 100;
    
    // Return the minimum progress (both requirements must be met)
    return Math.min(Math.min(referralProgress, pointsProgress), 100);
  };

  const progress = calculateProgress();

  if (showCompactView) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${className}`}>
        <EnhancedBirdBadge userId={userId} size="md" showTooltip={true} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{currentLevel.name}</span>
            {nextLevel && (
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% to {nextLevel.name}
              </span>
            )}
          </div>
          {nextLevel && (
            <Progress value={progress} className="h-2" />
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Bird Badge Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EnhancedBirdBadge userId={userId} size="lg" showTooltip={false} />
            <div>
              <h3 className="font-semibold">{currentLevel.name} YEILDER</h3>
              <p className="text-sm text-muted-foreground">{currentLevel.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{userStats.active_referrals_count}</div>
            <div className="text-xs text-muted-foreground">Referrals</div>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Target className="h-4 w-4" />
                Next: {nextLevel.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            
            <Progress value={progress} className="h-3" />
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span>
                  {userStats.active_referrals_count}/{nextLevel.min_referrals} referrals
                </span>
              </div>
              {nextLevel.min_points > 0 && (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>
                    {userStats.points}/{nextLevel.min_points} points
                  </span>
                </div>
              )}
            </div>
            
            {(nextLevel.referrals_needed > 0 || nextLevel.points_needed > 0) && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Still need: {nextLevel.referrals_needed > 0 && `${nextLevel.referrals_needed} more referrals`}
                {nextLevel.referrals_needed > 0 && nextLevel.points_needed > 0 && ', '}
                {nextLevel.points_needed > 0 && `${nextLevel.points_needed} more points`}
              </div>
            )}
          </div>
        )}

        {/* All Levels Milestone */}
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">Bird Level Milestones</div>
          <div className="flex justify-between">
            {allLevels.slice(0, 6).map((level) => {
              // Updated logic: only check referrals if min_points is 0
              const isAchieved = level.min_points === 0 
                ? userStats.active_referrals_count >= level.min_referrals
                : userStats.active_referrals_count >= level.min_referrals && userStats.points >= level.min_points;
              const isCurrent = currentLevel.id === level.id;
              
              return (
                <div 
                  key={level.id} 
                  className={`text-center ${isCurrent ? 'scale-110' : ''} transition-transform`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs mb-1 ${
                      isAchieved 
                        ? 'opacity-100' 
                        : 'opacity-30'
                    }`}
                    style={{ 
                      backgroundColor: isAchieved ? level.color + '20' : '#f3f4f6',
                      border: `2px solid ${isAchieved ? level.color : '#d1d5db'}`,
                      color: isAchieved ? level.color : '#6b7280'
                    }}
                  >
                    {level.emoji}
                  </div>
                  <div className="text-xs text-muted-foreground">{level.min_referrals}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};