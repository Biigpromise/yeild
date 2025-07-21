
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Users, Award, AlertCircle, Zap, RefreshCw } from "lucide-react";

interface RealtimeStats {
  totalPointsAwarded: number;
  totalUsersActive: number;
  tasksCompletedToday: number;
  averageTaskValue: number;
  topEarners: Array<{
    user_id: string;
    name: string;
    points_earned: number;
    tasks_completed: number;
  }>;
  recentTransactions: Array<{
    id: string;
    user_id: string;
    points: number;
    description: string;
    created_at: string;
    user_name: string;
  }>;
}

export const RealTimePointsPanel = () => {
  const [stats, setStats] = useState<RealtimeStats>({
    totalPointsAwarded: 0,
    totalUsersActive: 0,
    tasksCompletedToday: 0,
    averageTaskValue: 0,
    topEarners: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadStats();
    
    if (autoRefresh) {
      const interval = setInterval(loadStats, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's point transactions
      const { data: transactions, error: transError } = await supabase
        .from('point_transactions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false });

      // Get user profiles separately
      let userProfiles = new Map();
      if (transactions) {
        const userIds = [...new Set(transactions.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
        
        profiles?.forEach(p => userProfiles.set(p.id, p));
      }

      if (transError) {
        console.error('Error loading transactions:', transError);
        return;
      }

      // Calculate stats
      const totalPointsAwarded = transactions?.reduce((sum, t) => sum + Math.max(0, t.points), 0) || 0;
      const tasksCompletedToday = transactions?.filter(t => t.transaction_type === 'task_completion').length || 0;
      const activeUsers = new Set(transactions?.map(t => t.user_id) || []).size;
      const averageTaskValue = tasksCompletedToday > 0 ? Math.round(totalPointsAwarded / tasksCompletedToday) : 0;

      // Get top earners today
      const userPoints = new Map<string, { points: number; tasks: number; name: string }>();
      transactions?.forEach(t => {
        if (t.transaction_type === 'task_completion') {
          const userProfile = userProfiles.get(t.user_id);
          const existing = userPoints.get(t.user_id) || { points: 0, tasks: 0, name: userProfile?.name || 'Unknown User' };
          userPoints.set(t.user_id, {
            points: existing.points + t.points,
            tasks: existing.tasks + 1,
            name: userProfile?.name || 'Unknown User'
          });
        }
      });

      const topEarners = Array.from(userPoints.entries())
        .map(([user_id, data]) => ({
          user_id,
          name: data.name,
          points_earned: data.points,
          tasks_completed: data.tasks
        }))
        .sort((a, b) => b.points_earned - a.points_earned)
        .slice(0, 5);

      // Get recent transactions
      const recentTransactions = transactions?.slice(0, 10).map(t => {
        const userProfile = userProfiles.get(t.user_id);
        return {
          id: t.id,
          user_id: t.user_id,
          points: t.points,
          description: t.description || 'Point transaction',
          created_at: t.created_at,
          user_name: userProfile?.name || 'Unknown User'
        };
      }) || [];

      setStats({
        totalPointsAwarded,
        totalUsersActive: activeUsers,
        tasksCompletedToday,
        averageTaskValue,
        topEarners,
        recentTransactions
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load real-time stats');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Real-Time Points Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button variant="outline" size="sm" onClick={loadStats}>
                Refresh Now
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPointsAwarded.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Points Awarded Today</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.tasksCompletedToday}</div>
              <div className="text-sm text-green-600">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalUsersActive}</div>
              <div className="text-sm text-purple-600">Active Users</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.averageTaskValue}</div>
              <div className="text-sm text-orange-600">Avg Task Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Earners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Earners Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topEarners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users have earned points today yet
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topEarners.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.tasks_completed} tasks</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{user.points_earned} pts</div>
                    <div className="text-sm text-muted-foreground">
                      {user.tasks_completed > 0 ? Math.round(user.points_earned / user.tasks_completed) : 0} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Point Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.points > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">{transaction.user_name}</div>
                      <div className="text-sm text-muted-foreground">{transaction.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points} pts
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeAgo(transaction.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
