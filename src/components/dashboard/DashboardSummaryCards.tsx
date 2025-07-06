import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, CheckCircle, Star, Calendar, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardSummaryCardsProps {
  userStats: {
    points: number;
    level: number;
    tasksCompleted: number;
    currentStreak: number;
    rank: number;
    referrals: number;
  };
}

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({ userStats }) => {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState({
    pointsEarnedToday: 0,
    tasksCompletedToday: 0,
    messagesPostedToday: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTodayStats();
    }
  }, [user]);

  const loadTodayStats = async () => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      // Points earned today
      const { data: pointsData } = await supabase
        .from('point_transactions')
        .select('points')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .gt('points', 0);
      
      const pointsEarnedToday = pointsData?.reduce((sum, transaction) => sum + transaction.points, 0) || 0;

      // Tasks completed today
      const { data: tasksData } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .gte('created_at', today.toISOString());
      
      // Messages posted today
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      // Pending tasks
      const { data: pendingData } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      setTodayStats({
        pointsEarnedToday,
        tasksCompletedToday: tasksData?.length || 0,
        messagesPostedToday: messagesData?.length || 0,
        pendingTasks: pendingData?.length || 0
      });
    } catch (error) {
      console.error('Error loading today stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Points</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{todayStats.pointsEarnedToday}</div>
          <p className="text-xs text-muted-foreground">
            {todayStats.pointsEarnedToday > 0 ? '+' + todayStats.pointsEarnedToday + ' from yesterday' : 'No points earned yet'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{todayStats.tasksCompletedToday}</div>
          <p className="text-xs text-muted-foreground">
            {todayStats.pendingTasks > 0 && (
              <span className="text-orange-500">{todayStats.pendingTasks} pending</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Star className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{userStats.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            {userStats.currentStreak > 0 ? 'days in a row!' : 'Start your streak today'}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Community Activity</CardTitle>
          <Award className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{todayStats.messagesPostedToday}</div>
          <p className="text-xs text-muted-foreground">
            {todayStats.messagesPostedToday === 0 ? 'No posts today' : 'posts today'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};