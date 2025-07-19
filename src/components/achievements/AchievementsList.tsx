
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Crown, Star, Gem, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  badge_icon: string;
  badge_color: string;
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
}

interface AchievementsListProps {
  userStats: {
    points: number;
    tasksCompleted: number;
  };
}

export const AchievementsList: React.FC<AchievementsListProps> = ({ userStats }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value');

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trophy': return Trophy;
      case 'Award': return Award;
      case 'Crown': return Crown;
      case 'Star': return Star;
      case 'Gem': return Gem;
      default: return Trophy;
    }
  };

  const calculateProgress = (achievement: Achievement) => {
    let currentValue = 0;
    
    if (achievement.requirement_type === 'tasks_completed') {
      currentValue = userStats.tasksCompleted;
    } else if (achievement.requirement_type === 'points_earned') {
      currentValue = userStats.points;
    }

    return Math.min((currentValue / achievement.requirement_value) * 100, 100);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => isUnlocked(a.id));
  const lockedAchievements = achievements.filter(a => !isUnlocked(a.id));

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Unlocked Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => {
              const IconComponent = getIcon(achievement.badge_icon);
              
              return (
                <Card key={achievement.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-full"
                        style={{ backgroundColor: `${achievement.badge_color}20`, color: achievement.badge_color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-800">{achievement.title}</h4>
                        <p className="text-sm text-green-600 mb-2">{achievement.description}</p>
                        <Badge className="bg-green-100 text-green-800">
                          +{achievement.points_reward} points
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Achievements</h3>
        <div className="space-y-4">
          {lockedAchievements.map((achievement) => {
            const IconComponent = getIcon(achievement.badge_icon);
            const progress = calculateProgress(achievement);
            const isCompleted = progress >= 100;
            
            return (
              <Card key={achievement.id} className={isCompleted ? 'border-yellow-200 bg-yellow-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className={`p-2 rounded-full ${isCompleted ? 'animate-pulse' : 'opacity-50'}`}
                      style={{ backgroundColor: `${achievement.badge_color}20`, color: achievement.badge_color }}
                    >
                      {isCompleted ? <IconComponent className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge variant="outline">
                          +{achievement.points_reward} points
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {achievement.requirement_type === 'tasks_completed' 
                              ? `${userStats.tasksCompleted}/${achievement.requirement_value} tasks`
                              : `${userStats.points}/${achievement.requirement_value} points`
                            }
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {isCompleted && (
                        <div className="mt-2 text-sm font-medium text-yellow-600">
                          🎉 Ready to unlock! Complete another task to claim this achievement.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {achievements.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No achievements available</h3>
            <p className="text-muted-foreground">
              Achievements will appear here once they're added by administrators.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
