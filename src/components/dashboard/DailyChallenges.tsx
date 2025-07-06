import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Gift,
  MessageSquare,
  Trophy,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'tasks' | 'messages' | 'referrals' | 'points';
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  icon: React.ReactNode;
}

export const DailyChallenges: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDailyChallenges();
    }
  }, [user]);

  const loadDailyChallenges = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get today's stats
      const [tasksToday, messagesToday, pointsToday] = await Promise.all([
        // Tasks completed today
        supabase
          .from('task_submissions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .gte('created_at', today.toISOString()),
        
        // Messages sent today
        supabase
          .from('messages')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString()),
        
        // Points earned today
        supabase
          .from('point_transactions')
          .select('points')
          .eq('user_id', user.id)
          .gt('points', 0)
          .gte('created_at', today.toISOString())
      ]);

      const tasksCount = tasksToday.data?.length || 0;
      const messagesCount = messagesToday.data?.length || 0;
      const pointsSum = pointsToday.data?.reduce((sum, t) => sum + t.points, 0) || 0;

      // Define daily challenges
      const dailyChallenges: DailyChallenge[] = [
        {
          id: 'daily-tasks',
          title: 'Complete 3 Tasks',
          description: 'Complete 3 tasks to earn bonus points',
          type: 'tasks',
          target: 3,
          current: tasksCount,
          reward: 50,
          completed: tasksCount >= 3,
          icon: <Target className="h-5 w-5 text-blue-500" />
        },
        {
          id: 'daily-messages',
          title: 'Send 5 Messages',
          description: 'Be active in the community chat',
          type: 'messages',
          target: 5,
          current: messagesCount,
          reward: 25,
          completed: messagesCount >= 5,
          icon: <MessageSquare className="h-5 w-5 text-green-500" />
        },
        {
          id: 'daily-points',
          title: 'Earn 100 Points',
          description: 'Reach the daily points goal',
          type: 'points',
          target: 100,
          current: pointsSum,
          reward: 30,
          completed: pointsSum >= 100,
          icon: <Trophy className="h-5 w-5 text-yellow-500" />
        },
        {
          id: 'daily-engagement',
          title: 'Stay Active',
          description: 'Login and check in for the day',
          type: 'referrals',
          target: 1,
          current: 1, // Always 1 if they're viewing this
          reward: 10,
          completed: true,
          icon: <CheckCircle className="h-5 w-5 text-purple-500" />
        }
      ];

      setChallenges(dailyChallenges);
    } catch (error) {
      console.error('Error loading daily challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId: string, reward: number) => {
    if (!user) return;

    try {
      // Award points
      await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: reward,
          transaction_type: 'daily_challenge',
          description: `Daily challenge completed: ${challengeId}`
        });

      // Update user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: profile.points + reward })
          .eq('id', user.id);
      }

      // Reload challenges to show updated state
      loadDailyChallenges();
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalRewards = challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.reward, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-2 bg-muted rounded w-full mb-2" />
                <div className="h-8 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Challenges
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Resets in {getTimeUntilReset()}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {completedChallenges}/{challenges.length} Completed
          </span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Gift className="h-3 w-3" />
            {totalRewards} pts earned
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id}
            className={`p-4 border rounded-lg transition-all ${
              challenge.completed 
                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                : 'bg-background hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {challenge.icon}
                <div>
                  <h4 className="font-medium">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
              </div>
              {challenge.completed && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress: {challenge.current}/{challenge.target}</span>
                <span className="text-muted-foreground">
                  +{challenge.reward} pts
                </span>
              </div>
              <Progress 
                value={(challenge.current / challenge.target) * 100} 
                className="h-2"
              />
            </div>

            {challenge.completed && (
              <div className="mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => claimReward(challenge.id, challenge.reward)}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Claim Reward ({challenge.reward} pts)
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};