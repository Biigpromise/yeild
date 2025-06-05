
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Calendar, 
  Target, 
  Trophy,
  CheckCircle,
  Clock
} from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  weeklyGoal: number;
  weeklyProgress: number;
}

export const StreakTracker = ({ 
  currentStreak, 
  longestStreak, 
  todayCompleted, 
  weeklyGoal,
  weeklyProgress 
}: StreakTrackerProps) => {
  // Mock data for streak calendar - in real app this would come from API
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Mock activity data - in real app this would be actual user data
      const hasActivity = Math.random() > 0.3; // 70% chance of activity
      
      days.push({
        date: date.getDate(),
        hasActivity,
        isToday: i === 0,
        dayName: date.toLocaleDateString('en', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const last30Days = getLast30Days();
  const streakMilestones = [
    { days: 3, title: "Getting Started", reward: "10 bonus points", achieved: currentStreak >= 3 },
    { days: 7, title: "Week Warrior", reward: "50 bonus points", achieved: currentStreak >= 7 },
    { days: 14, title: "Two Week Champion", reward: "100 bonus points", achieved: currentStreak >= 14 },
    { days: 30, title: "Month Master", reward: "300 bonus points", achieved: currentStreak >= 30 },
    { days: 60, title: "Streak Legend", reward: "500 bonus points", achieved: currentStreak >= 60 },
  ];

  const getNextMilestone = () => {
    return streakMilestones.find(milestone => !milestone.achieved);
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="space-y-6">
      {/* Current Streak Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <p className="text-3xl font-bold text-orange-500">{currentStreak}</p>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <Badge variant={todayCompleted ? "default" : "destructive"} className="mt-2">
              {todayCompleted ? "Today Complete" : "Complete Today"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p className="text-3xl font-bold text-yellow-500">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            {currentStreak === longestStreak && currentStreak > 0 && (
              <Badge variant="outline" className="mt-2">
                Personal Record!
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-3xl font-bold text-blue-500">{weeklyProgress}/{weeklyGoal}</p>
            <p className="text-sm text-muted-foreground">Weekly Goal</p>
            <Progress 
              value={(weeklyProgress / weeklyGoal) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Streak Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Last 30 Days Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-xs text-muted-foreground font-medium p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {last30Days.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square rounded-md border-2 flex items-center justify-center text-xs font-medium
                  ${day.hasActivity 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-muted border-muted text-muted-foreground'
                  }
                  ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                {day.date}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span>Active day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded-sm"></div>
              <span>Inactive day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm ring-1 ring-blue-500"></div>
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Streak Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {streakMilestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  milestone.achieved 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                    : 'bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  milestone.achieved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {milestone.achieved ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${milestone.achieved ? 'text-green-700 dark:text-green-300' : ''}`}>
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {milestone.days} days streak • {milestone.reward}
                  </p>
                </div>
                <Badge variant={milestone.achieved ? "default" : "outline"}>
                  {milestone.achieved ? "Unlocked" : `${milestone.days - currentStreak} more days`}
                </Badge>
              </div>
            ))}
          </div>

          {nextMilestone && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                Next Milestone: {nextMilestone.title}
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                {nextMilestone.days - currentStreak} more days to unlock {nextMilestone.reward}
              </p>
              <Progress 
                value={(currentStreak / nextMilestone.days) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
