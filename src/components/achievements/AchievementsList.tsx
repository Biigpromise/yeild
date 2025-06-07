
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { rewardsService, Achievement, UserAchievement } from "@/services/rewardsService";
import { toast } from "sonner";
import { Trophy, Award, Medal, Star, Coins, Target } from "lucide-react";

interface AchievementsListProps {
  userStats: {
    tasksCompleted: number;
    points: number;
  };
}

export const AchievementsList = ({ userStats }: AchievementsListProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [achievementsData, userAchievementsData] = await Promise.all([
        rewardsService.getAchievements(),
        rewardsService.getUserAchievements()
      ]);
      setAchievements(achievementsData);
      setUserAchievements(userAchievementsData);
    } catch (error) {
      console.error("Error loading achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="h-6 w-6" />;
      case 'award':
        return <Award className="h-6 w-6" />;
      case 'medal':
        return <Medal className="h-6 w-6" />;
      case 'star':
        return <Star className="h-6 w-6" />;
      case 'coins':
        return <Coins className="h-6 w-6" />;
      case 'badge':
        return <Target className="h-6 w-6" />;
      default:
        return <Trophy className="h-6 w-6" />;
    }
  };

  const calculateProgress = (achievement: Achievement) => {
    const earned = userAchievements.some(ua => ua.achievement_id === achievement.id);
    if (earned) return 100;

    let currentValue = 0;
    switch (achievement.requirement_type) {
      case 'tasks_completed':
        currentValue = userStats.tasksCompleted;
        break;
      case 'points_earned':
        currentValue = userStats.points;
        break;
    }

    return Math.min((currentValue / achievement.requirement_value) * 100, 100);
  };

  const getAchievementTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'streak':
        return 'bg-green-100 text-green-800';
      case 'special':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Achievements</h2>
        <p className="text-muted-foreground">Track your progress and unlock rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => {
          const isEarned = earnedAchievementIds.includes(achievement.id);
          const progress = calculateProgress(achievement);
          
          return (
            <Card key={achievement.id} className={`${isEarned ? 'border-green-200 bg-green-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isEarned ? 'bg-green-100' : 'bg-gray-100'}`} 
                         style={{ color: achievement.badge_color }}>
                      {getAchievementIcon(achievement.badge_icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <Badge className={getAchievementTypeColor(achievement.achievement_type)}>
                        {achievement.achievement_type}
                      </Badge>
                    </div>
                  </div>
                  {isEarned && (
                    <Badge className="bg-green-100 text-green-800">
                      Earned!
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {achievement.requirement_type === 'tasks_completed' ? 'Tasks completed' : 'Points earned'}
                    </span>
                    <span>
                      {achievement.requirement_type === 'tasks_completed' 
                        ? `${Math.min(userStats.tasksCompleted, achievement.requirement_value)}/${achievement.requirement_value}`
                        : `${Math.min(userStats.points, achievement.requirement_value)}/${achievement.requirement_value}`
                      }
                    </span>
                  </div>
                </div>

                {achievement.points_reward > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 font-medium">+{achievement.points_reward} points</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements available</h3>
          <p className="text-gray-500">Complete tasks to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};
