
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BIRD_LEVELS } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { DollarSign, Users, Trophy, Crown, Star, X } from 'lucide-react';

interface BirdProgressionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BirdProgressionModal: React.FC<BirdProgressionModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    activeReferrals: 0,
    points: 0,
    currentLevel: BIRD_LEVELS[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && open) {
      loadUserStats();
    }
  }, [user, open]);

  const loadUserStats = async () => {
    try {
      const profile = await userService.getUserProfile(user!.id);
      if (profile) {
        const activeReferrals = profile.active_referrals_count || 0;
        const points = profile.points || 0;
        const currentLevel = userService.getBirdLevel(activeReferrals, points);
        
        setUserStats({
          activeReferrals,
          points,
          currentLevel
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const earningPotentials = [
    { level: 'Dove', earning: '$50-100', description: 'Basic tasks and referrals' },
    { level: 'Hawk', earning: '$100-250', description: 'Premium tasks unlock' },
    { level: 'Eagle', earning: '$250-500', description: 'Exclusive opportunities' },
    { level: 'Falcon', earning: '$500-1000', description: 'Elite task access' },
    { level: 'Phoenix', earning: '$1000+', description: 'Legendary earning potential' },
  ];

  const getBirdEmoji = (level: string) => {
    switch (level) {
      case 'Phoenix': return '🔥';
      case 'Falcon': return '🦅';
      case 'Eagle': return '🦅';
      case 'Hawk': return '🦅';
      default: return '🕊️';
    }
  };

  const getProgressToNextLevel = (currentLevel: any, activeReferrals: number, points: number) => {
    const currentIndex = BIRD_LEVELS.findIndex(level => level.name === currentLevel.name);
    const nextLevel = BIRD_LEVELS[currentIndex + 1];
    
    if (!nextLevel) return { progress: 100, nextLevel: null, needed: 0 };
    
    const referralProgress = nextLevel.min_referrals > 0 ? (activeReferrals / nextLevel.min_referrals) * 100 : 100;
    const pointsProgress = nextLevel.min_points > 0 ? (points / nextLevel.min_points) * 100 : 100;
    const progress = Math.min(referralProgress, pointsProgress);
    
    return {
      progress: Math.min(progress, 100),
      nextLevel,
      needed: Math.max(0, nextLevel.min_referrals - activeReferrals)
    };
  };

  const { progress, nextLevel, needed } = getProgressToNextLevel(
    userStats.currentLevel,
    userStats.activeReferrals,
    userStats.points
  );

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Your Bird Progression Journey
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getBirdEmoji(userStats.currentLevel.name)}</div>
                  <div>
                    <h3 className="text-xl font-bold">{userStats.currentLevel.name}</h3>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 text-lg">
                    {earningPotentials.find(e => e.level === userStats.currentLevel.name)?.earning || '$25-50'}
                  </div>
                  <div className="text-xs text-muted-foreground">Monthly Potential</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userStats.activeReferrals}</div>
                  <div className="text-sm text-muted-foreground">Active Referrals</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userStats.points}</div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
                </div>
              </div>

              {nextLevel && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress to {nextLevel.name}</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {needed > 0 ? `${needed} more referrals needed` : 'You\'re ready to advance!'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Levels */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">All Bird Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BIRD_LEVELS.map((level) => {
                const isCurrentLevel = level.name === userStats.currentLevel.name;
                const isUnlocked = userStats.activeReferrals >= level.min_referrals && userStats.points >= level.min_points;
                const earnings = earningPotentials.find(e => e.level === level.name);

                return (
                  <Card key={level.name} className={`transition-all duration-300 ${
                    isCurrentLevel ? 'ring-2 ring-blue-400 bg-blue-50' :
                    isUnlocked ? 'bg-green-50 border-green-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getBirdEmoji(level.name)}</span>
                          <div>
                            <h4 className="font-semibold">{level.name}</h4>
                            {isCurrentLevel && (
                              <Badge className="text-xs bg-blue-500">Current</Badge>
                            )}
                            {isUnlocked && !isCurrentLevel && (
                              <Badge className="text-xs bg-green-500">Unlocked</Badge>
                            )}
                          </div>
                        </div>
                        {level.name === 'Phoenix' && (
                          <Crown className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{level.min_referrals} referrals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            <span>{level.min_points} points</span>
                          </div>
                        </div>

                        <div className="text-sm font-semibold text-green-600">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          {earnings?.earning || '$25-50'}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {level.description}
                        </div>

                        {level.benefits && level.benefits.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium mb-1">Benefits:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {level.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Tips Section */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Pro Tips to Level Up Faster
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-800">Build Your Network:</div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Share on social media</li>
                    <li>• Invite friends and family</li>
                    <li>• Join referral communities</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-800">Maximize Points:</div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Complete daily tasks</li>
                    <li>• Focus on high-point tasks</li>
                    <li>• Maintain quality submissions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
