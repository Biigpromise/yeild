import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserProfileBirds } from '@/components/community/UserProfileBirds';
import { BirdAvatar } from '@/components/bird/BirdAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Target, 
  Star, 
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Users,
  Gift
} from 'lucide-react';

const Birds: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    points: 0,
    tasksCompleted: 0,
    level: 1,
    activeReferrals: 0
  });
  const [birdLevels, setBirdLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadBirdLevels();
    }
  }, [user]);

  const loadBirdLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('bird_levels')
        .select('*')
        .order('min_referrals', { ascending: true });

      if (error) {
        console.error('Error fetching bird levels:', error);
        return;
      }

      setBirdLevels(data || []);
    } catch (error) {
      console.error('Error loading bird levels:', error);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const profile = await userService.getUserProfile(user.id);
      if (profile) {
        setUserStats({
          points: profile.points || 0,
          tasksCompleted: profile.tasks_completed || 0,
          level: profile.level || 1,
          activeReferrals: profile.active_referrals_count || 0
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBirdLevel = () => {
    if (!birdLevels.length) return null;
    
    for (let i = birdLevels.length - 1; i >= 0; i--) {
      const level = birdLevels[i];
      if (userStats.activeReferrals >= level.min_referrals && userStats.points >= level.min_points) {
        return { ...level, index: i };
      }
    }
    return { ...birdLevels[0], index: 0 };
  };

  const currentBirdLevel = getCurrentBirdLevel();
  const nextLevel = currentBirdLevel && birdLevels[currentBirdLevel.index + 1];

  const calculateProgress = () => {
    if (!nextLevel) return 100;
    
    const referralProgress = (userStats.activeReferrals / nextLevel.min_referrals) * 100;
    const pointsProgress = (userStats.points / nextLevel.min_points) * 100;
    return Math.min((referralProgress + pointsProgress) / 2, 100);
  };

  if (loading || !currentBirdLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your bird status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/20 to-orange-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <BirdAvatar name={currentBirdLevel.name} size="xl" animated={true} />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Bird Status System
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Rise through the ranks and unlock exclusive benefits as you complete tasks and refer friends
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 text-white"
                style={{ backgroundColor: currentBirdLevel.color }}
              >
                <Crown className="h-3 w-3" />
                {currentBirdLevel.name}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Level {userStats.level}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Your Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserProfileBirds 
                  points={userStats.points}
                  tasksCompleted={userStats.tasksCompleted}
                  level={userStats.level}
                  activeReferrals={userStats.activeReferrals}
                />
                
                {nextLevel && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress to {nextLevel.name}</span>
                      <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Referrals: {userStats.activeReferrals}/{nextLevel.min_referrals}</span>
                      <span>Points: {userStats.points.toLocaleString()}/{nextLevel.min_points.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points</span>
                  <span className="font-bold">{userStats.points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referrals</span>
                  <span className="font-bold">{userStats.activeReferrals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks Done</span>
                  <span className="font-bold">{userStats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-bold">{userStats.level}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5" />
                  Current Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentBirdLevel.benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Bird Levels */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            All Bird Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {birdLevels.map((level, index) => {
              const isUnlocked = userStats.activeReferrals >= level.min_referrals && userStats.points >= level.min_points;
              const isCurrent = currentBirdLevel && level.name === currentBirdLevel.name;
              
              return (
                <Card 
                  key={level.name}
                  className={`relative transition-all duration-300 hover:scale-105 ${
                    isCurrent 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : isUnlocked 
                        ? 'opacity-100' 
                        : 'opacity-60'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
                      Current
                    </div>
                  )}
                  
                  <CardContent className="p-4 text-center">
                    <div className="mb-3 flex justify-center">
                      <BirdAvatar 
                        name={level.name} 
                        size="lg" 
                        animated={isCurrent || level.name.toLowerCase() === 'phoenix'} 
                      />
                    </div>
                    <h3 
                      className="font-bold text-lg mb-1"
                      style={{ color: isUnlocked ? level.color : undefined }}
                    >
                      {level.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {level.description}
                    </p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Referrals:</span>
                        <span className="font-bold">{level.min_referrals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Points:</span>
                        <span className="font-bold">{level.min_points.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-1">Benefits:</p>
                      <div className="space-y-1">
                        {level.benefits?.slice(0, 2).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Zap className="h-2 w-2 text-yellow-500" />
                            <span className="text-xs">{benefit}</span>
                          </div>
                        )) || (
                          <div className="text-xs text-muted-foreground">Coming soon...</div>
                        )}
                        {level.benefits && level.benefits.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{level.benefits.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievement Showcase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="font-bold text-2xl">{userStats.activeReferrals}</p>
                <p className="text-sm text-muted-foreground">Active Referrals</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-bold text-2xl">{userStats.tasksCompleted}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="font-bold text-2xl">{userStats.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Birds;