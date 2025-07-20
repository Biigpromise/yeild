import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, MessageSquare, Heart, Eye, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  chatMessages: number;
  userGrowth: Array<{ date: string; users: number }>;
  contentMetrics: Array<{ date: string; posts: number; stories: number; messages: number }>;
  topUsers: Array<{ name: string; points: number; engagement: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      // Fetch basic metrics
      const [usersResult, postsResult, likesResult, messagesResult] = await Promise.all([
        supabase.from('profiles').select('id, created_at, points', { count: 'exact' }),
        supabase.from('posts').select('id, created_at, view_count', { count: 'exact' }),
        supabase.from('post_likes').select('id', { count: 'exact' }),
        supabase.from('messages').select('id, created_at', { count: 'exact' })
      ]);

      // Calculate metrics
      const totalUsers = usersResult.count || 0;
      const totalPosts = postsResult.count || 0;
      const totalLikes = likesResult.count || 0;
      const totalViews = postsResult.data?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;
      const chatMessages = messagesResult.count || 0;

      // Active users (users who logged in within the last 7 days)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('last_login_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // User growth over time
      const userGrowthData = [];
      for (let i = parseInt(timeRange); i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .lte('created_at', date.toISOString());
        
        userGrowthData.push({
          date: date.toLocaleDateString(),
          users: count || 0
        });
      }

      // Content metrics over time
      const contentMetricsData = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const [posts, stories, messages] = await Promise.all([
          supabase.from('posts').select('id', { count: 'exact' }).gte('created_at', dateStr).lt('created_at', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('stories').select('id', { count: 'exact' }).gte('created_at', dateStr).lt('created_at', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('messages').select('id', { count: 'exact' }).gte('created_at', dateStr).lt('created_at', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString())
        ]);

        contentMetricsData.push({
          date: date.toLocaleDateString(),
          posts: posts.count || 0,
          stories: stories.count || 0,
          messages: messages.count || 0
        });
      }

      // Top users by engagement
      const { data: topUsersData } = await supabase
        .from('profiles')
        .select('name, points, tasks_completed, followers_count')
        .order('points', { ascending: false })
        .limit(10);

      const topUsers = topUsersData?.map(user => ({
        name: user.name || 'Anonymous',
        points: user.points || 0,
        engagement: (user.tasks_completed || 0) + (user.followers_count || 0)
      })) || [];

      setAnalytics({
        totalUsers,
        activeUsers: activeUsers || 0,
        totalPosts,
        totalLikes,
        totalViews,
        chatMessages,
        userGrowth: userGrowthData,
        contentMetrics: contentMetricsData,
        topUsers
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {analytics.activeUsers} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.totalPosts.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Total Likes</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.totalLikes.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Chat Messages</span>
            </div>
            <p className="text-2xl font-bold mt-2">{analytics.chatMessages.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%
            </p>
            <Progress 
              value={(analytics.activeUsers / analytics.totalUsers) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.contentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="posts" fill="#8884d8" />
                <Bar dataKey="stories" fill="#82ca9d" />
                <Bar dataKey="messages" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topUsers.slice(0, 5).map((user, index) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.points} points</p>
                  <p className="text-sm text-muted-foreground">{user.engagement} engagement</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};