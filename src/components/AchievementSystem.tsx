
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Medal, 
  Crown, 
  Zap, 
  Award,
  Lock
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "tasks" | "streaks" | "points" | "special";
  requirement: number;
  current: number;
  unlocked: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface AchievementSystemProps {
  userStats: {
    tasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    points: number;
    level: number;
  };
}

export const AchievementSystem = ({ userStats }: AchievementSystemProps) => {
  const achievements: Achievement[] = [
    {
      id: "first-task",
      title: "First Steps",
      description: "Complete your first task",
      icon: <Target className="h-5 w-5" />,
      category: "tasks",
      requirement: 1,
      current: userStats.tasksCompleted,
      unlocked: userStats.tasksCompleted >= 1,
      rarity: "common"
    },
    {
      id: "task-master",
      title: "Task Master",
      description: "Complete 10 tasks",
      icon: <Trophy className="h-5 w-5" />,
      category: "tasks",
      requirement: 10,
      current: userStats.tasksCompleted,
      unlocked: userStats.tasksCompleted >= 10,
      rarity: "rare"
    },
    {
      id: "century",
      title: "Century Club",
      description: "Complete 100 tasks",
      icon: <Crown className="h-5 w-5" />,
      category: "tasks",
      requirement: 100,
      current: userStats.tasksCompleted,
      unlocked: userStats.tasksCompleted >= 100,
      rarity: "epic"
    },
    {
      id: "streak-starter",
      title: "Streak Starter",
      description: "Maintain a 3-day streak",
      icon: <Flame className="h-5 w-5" />,
      category: "streaks",
      requirement: 3,
      current: userStats.longestStreak,
      unlocked: userStats.longestStreak >= 3,
      rarity: "common"
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: <Medal className="h-5 w-5" />,
      category: "streaks",
      requirement: 7,
      current: userStats.longestStreak,
      unlocked: userStats.longestStreak >= 7,
      rarity: "rare"
    },
    {
      id: "month-master",
      title: "Month Master",
      description: "Maintain a 30-day streak",
      icon: <Star className="h-5 w-5" />,
      category: "streaks",
      requirement: 30,
      current: userStats.longestStreak,
      unlocked: userStats.longestStreak >= 30,
      rarity: "legendary"
    },
    {
      id: "points-collector",
      title: "Points Collector",
      description: "Earn 1,000 points",
      icon: <Zap className="h-5 w-5" />,
      category: "points",
      requirement: 1000,
      current: userStats.points,
      unlocked: userStats.points >= 1000,
      rarity: "rare"
    },
    {
      id: "high-roller",
      title: "High Roller",
      description: "Earn 10,000 points",
      icon: <Award className="h-5 w-5" />,
      category: "points",
      requirement: 10000,
      current: userStats.points,
      unlocked: userStats.points >= 10000,
      rarity: "epic"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600";
      case "rare": return "text-blue-600";
      case "epic": return "text-purple-600";
      case "legendary": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements ({unlockedAchievements.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked
                    ? "bg-card border-border shadow-md"
                    : "bg-muted/50 border-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      achievement.unlocked
                        ? getRarityColor(achievement.rarity)
                        : "bg-muted"
                    } text-white`}
                  >
                    {achievement.unlocked ? achievement.icon : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${achievement.unlocked ? "" : "text-muted-foreground"}`}>
                        {achievement.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getRarityTextColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className={`text-sm ${achievement.unlocked ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                      {achievement.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.min(achievement.current, achievement.requirement)}/{achievement.requirement}
                        </span>
                      </div>
                      <Progress
                        value={(achievement.current / achievement.requirement) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
