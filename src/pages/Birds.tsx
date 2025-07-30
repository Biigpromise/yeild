import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserProfileBirds } from '@/components/community/UserProfileBirds';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

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

  const birdLevels = [
    {
      name: 'Dove',
      icon: '🕊️',
      color: '#94a3b8',
      requirements: { referrals: 0, points: 0 },
      description: 'Welcome to the nest! Start your journey.',
      benefits: ['Basic task access', 'Community participation']
    },
    {
      name: 'Hawk',
      icon: '🦅',
      color: '#f59e0b',
      requirements: { referrals: 5, points: 1000 },
      description: 'Sharp-eyed and focused hunter.',
      benefits: ['5% bonus earnings', 'Priority support', 'Exclusive tasks']
    },
    {
      name: 'Eagle',
      icon: '🦅',
      color: '#8b5cf6',
      requirements: { referrals: 15, points: 5000 },
      description: 'Soaring high with impressive achievements.',
      benefits: ['10% bonus earnings', 'VIP badge', 'Early access features']
    },
    {
      name: 'Falcon',
      icon: '🦅',
      color: '#3b82f6',
      requirements: { referrals: 30, points: 15000 },
      description: 'Lightning-fast and incredibly skilled.',
      benefits: ['15% bonus earnings', 'Custom badge', 'Mentor privileges']
    },
    {
      name: 'Phoenix',
      icon: '🔥',
      color: '#dc2626',
      requirements: { referrals: 50, points: 50000 },
      description: 'Legendary status - risen from dedication!',
      benefits: ['25% bonus earnings', 'Phoenix crown', 'Legend status', 'Special rewards']
    }
  ];

  const currentBirdLevel = userService.getBirdLevel(userStats.activeReferrals, userStats.points);
  const currentLevelIndex = birdLevels.findIndex(level => level.name.toLowerCase() === currentBirdLevel.name.toLowerCase());
  const nextLevel = birdLevels[currentLevelIndex + 1];

  const calculateProgress = () => {
    if (!nextLevel) return 100;
    
    const referralProgress = (userStats.activeReferrals / nextLevel.requirements.referrals) * 100;
    const pointsProgress = (userStats.points / nextLevel.requirements.points) * 100;
    return Math.min((referralProgress + pointsProgress) / 2, 100);
  };

  if (loading) {
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">{currentBirdLevel.icon === 'phoenix' ? '🔥' : '🦅'}</span>
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
                      <span>Referrals: {userStats.activeReferrals}/{nextLevel.requirements.referrals}</span>
                      <span>Points: {userStats.points.toLocaleString()}/{nextLevel.requirements.points.toLocaleString()}</span>
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
                  {birdLevels.find(level => level.name.toLowerCase() === currentBirdLevel.name.toLowerCase())?.benefits.map((benefit, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {birdLevels.map((level, index) => {
              const isUnlocked = index <= currentLevelIndex;
              const isCurrent = index === currentLevelIndex;
              
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
                    <div className="text-4xl mb-2">{level.icon}</div>
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
                        <span className="font-bold">{level.requirements.referrals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Points:</span>
                        <span className="font-bold">{level.requirements.points.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-1">Benefits:</p>
                      <div className="space-y-1">
                        {level.benefits.slice(0, 2).map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Zap className="h-2 w-2 text-yellow-500" />
                            <span className="text-xs">{benefit}</span>
                          </div>
                        ))}
                        {level.benefits.length > 2 && (
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