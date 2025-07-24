
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Activity,
  Eye,
  MessageSquare,
  Award
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdminAnalytics = () => {
  const { data: userStats, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-user-analytics'],
    queryFn: async () => {
      const { data: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('tasks_completed', 1);

      const { data: newUsersToday } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      return {
        totalUsers: totalUsers?.length || 0,
        activeUsers: activeUsers?.length || 0,
        newUsersToday: newUsersToday?.length || 0
      };
    },
  });

  const { data: taskStats, isLoading: loadingTasks } = useQuery({
    queryKey: ['admin-task-analytics'],
    queryFn: async () => {
      const { data: totalTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' });

      const { data: activeTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      const { data: pendingSubmissions } = await supabase
        .from('task_submissions')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      return {
        totalTasks: totalTasks?.length || 0,
        activeTasks: activeTasks?.length || 0,
        pendingSubmissions: pendingSubmissions?.length || 0
      };
    },
  });

  const { data: platformMetrics } = useQuery({
    queryKey: ['admin-platform-metrics'],
    queryFn: async () => {
      const { data: totalPoints } = await supabase
        .from('profiles')
        .select('points');

      const { data: totalMessages } = await supabase
        .from('messages')
        .select('id', { count: 'exact' });

      const totalPointsAwarded = totalPoints?.reduce((sum, user) => sum + (user.points || 0), 0) || 0;

      return {
        totalPointsAwarded,
        totalMessages: totalMessages?.length || 0,
        averagePointsPerUser: totalPoints?.length ? Math.round(totalPointsAwarded / totalPoints.length) : 0
      };
    },
  });

  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 150 },
    { month: 'Mar', users: 180 },
    { month: 'Apr', users: 220 },
    { month: 'May', users: 280 },
    { month: 'Jun', users: 350 },
  ];

  const roleDistribution = [
    { name: 'Users', value: userStats?.totalUsers || 0, color: '#0088FE' },
    { name: 'Brands', value: 25, color: '#00C49F' },
    { name: 'Admins', value: 3, color: '#FFBB28' },
  ];

  const taskCompletionData = [
    { day: 'Mon', completed: 45, started: 60 },
    { day: 'Tue', completed: 52, started: 70 },
    { day: 'Wed', completed: 38, started: 55 },
    { day: 'Thu', completed: 61, started: 80 },
    { day: 'Fri', completed: 55, started: 75 },
    { day: 'Sat', completed: 42, started: 60 },
    { day: 'Sun', completed: 35, started: 50 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <p className="text-muted-foreground">Comprehensive platform analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{userStats?.activeUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{taskStats?.activeTasks || 0}</p>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{platformMetrics?.totalPointsAwarded || 0}</p>
                <p className="text-sm text-muted-foreground">Points Awarded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="tasks">Task Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                  <Bar dataKey="started" fill="#82ca9d" name="Started" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{platformMetrics?.totalMessages || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{userStats?.newUsersToday || 0}</p>
                    <p className="text-sm text-muted-foreground">New Users Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{platformMetrics?.averagePointsPerUser || 0}</p>
                    <p className="text-sm text-muted-foreground">Avg Points/User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Revenue analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
