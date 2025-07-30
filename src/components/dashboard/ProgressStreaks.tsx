import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Calendar, 
  Target, 
  MessageSquare,
  TrendingUp,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Streak {
  id: string;
  type: string;
  current: number;
  longest: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  lastActivity?: string;
}

export const ProgressStreaks: React.FC = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStreaks();
    }
  }, [user]);

  const loadStreaks = async () => {
    if (!user) return;

    try {
      // Get user streaks from database
      const { data: userStreaks } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);

      // Get login streak (calculate from last_login_at)
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_at, created_at')
        .eq('id', user.id)
        .maybeSingle();

      const calculateLoginStreak = () => {
        if (!profile?.last_login_at) return 0;
        
        const today = new Date();
        const lastLogin = new Date(profile.last_login_at);
        const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If last login was today or yesterday, maintain streak
        return diffDays <= 1 ? Math.max(1, diffDays) : 0;
      };

      // Calculate current streaks
      const today = new Date();
      const streakData: Streak[] = [
        {
          id: 'login',
          type: 'login',
          current: calculateLoginStreak(),
          longest: 7, // Mock data - would track in database
          icon: <Calendar className="h-5 w-5" />,
          title: 'Login Streak',
          description: 'Consecutive days logged in',
          color: 'bg-blue-500',
          lastActivity: profile?.last_login_at
        },
        {
          id: 'task_completion',
          type: 'task_completion',
          current: userStreaks?.find(s => s.streak_type === 'task_completion')?.current_streak || 0,
          longest: userStreaks?.find(s => s.streak_type === 'task_completion')?.longest_streak || 0,
          icon: <Target className="h-5 w-5" />,
          title: 'Task Streak',
          description: 'Tasks completed daily',
          color: 'bg-green-500',
          lastActivity: userStreaks?.find(s => s.streak_type === 'task_completion')?.last_activity_date
        },
        {
          id: 'community',
          type: 'community',
          current: 3, // Mock data - would calculate from messages
          longest: 8,
          icon: <MessageSquare className="h-5 w-5" />,
          title: 'Community Streak',
          description: 'Daily community participation',
          color: 'bg-purple-500'
        },
        {
          id: 'points',
          type: 'points',
          current: 5, // Mock data - would calculate from point transactions
          longest: 12,
          icon: <TrendingUp className="h-5 w-5" />,
          title: 'Earning Streak',
          description: 'Points earned daily',
          color: 'bg-yellow-500'
        }
      ];

      setStreaks(streakData);
    } catch (error) {
      console.error('Error loading streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakLevel = (current: number) => {
    if (current >= 30) return { level: 'Legendary', color: 'text-purple-500' };
    if (current >= 14) return { level: 'Master', color: 'text-orange-500' };
    if (current >= 7) return { level: 'Expert', color: 'text-blue-500' };
    if (current >= 3) return { level: 'Rising', color: 'text-green-500' };
    return { level: 'Beginner', color: 'text-muted-foreground' };
  };

  const getStreakEmoji = (current: number) => {
    if (current >= 30) return '🏆';
    if (current >= 14) return '🔥';
    if (current >= 7) return '⚡';
    if (current >= 3) return '✨';
    return '💫';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Progress Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCurrentStreak = streaks.reduce((sum, streak) => sum + streak.current, 0);
  const bestStreak = Math.max(...streaks.map(s => s.longest));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Progress Streaks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              Best: {bestStreak} days
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Keep your momentum going! Total active streak: {totalCurrentStreak} days
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streaks.map((streak) => {
            const level = getStreakLevel(streak.current);
            const emoji = getStreakEmoji(streak.current);
            
            return (
              <div 
                key={streak.id}
                className="p-4 border rounded-lg hover:shadow-md transition-all bg-gradient-to-br from-background to-muted/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {streak.icon}
                    <h4 className="font-medium">{streak.title}</h4>
                  </div>
                  <span className="text-2xl">{emoji}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {streak.current}
                    </span>
                    <Badge variant="outline" className={level.color}>
                      {level.level}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {streak.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Current: {streak.current} days</span>
                    <span>Best: {streak.longest} days</span>
                  </div>
                  
                  {/* Streak visualization */}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(Math.min(streak.current, 7))].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${streak.color}`}
                      />
                    ))}
                    {streak.current > 7 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{streak.current - 7}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Motivational message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-primary" />
            <span className="font-medium">Keep it up!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Consistency is key to success. Your streaks show your dedication and help you build lasting habits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};