
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  pendingSubmissions: number;
  approvalRate: number;
  categoryStats: Array<{ name: string; count: number }>;
  monthlyStats: Array<{ month: string; submissions: number; approvals: number }>;
}

export const TaskAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    pendingSubmissions: 0,
    approvalRate: 0,
    categoryStats: [],
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get task statistics
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, category, created_at');

      if (tasksError) throw tasksError;

      // Get submission statistics
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('status, submitted_at');

      if (submissionsError) throw submissionsError;

      // Calculate basic stats
      const totalTasks = tasks?.length || 0;
      const activeTasks = tasks?.filter(t => t.status === 'active').length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const pendingSubmissions = submissions?.filter(s => s.status === 'pending').length || 0;
      const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
      const approvalRate = submissions?.length ? Math.round((approvedSubmissions / submissions.length) * 100) : 0;

      // Calculate category stats
      const categoryMap = new Map();
      tasks?.forEach(task => {
        if (task.category) {
          categoryMap.set(task.category, (categoryMap.get(task.category) || 0) + 1);
        }
      });
      const categoryStats = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));

      // Calculate monthly stats (last 6 months)
      const monthlyMap = new Map();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      submissions?.forEach(submission => {
        const date = new Date(submission.submitted_at);
        if (date >= sixMonthsAgo) {
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { submissions: 0, approvals: 0 });
          }
          const monthData = monthlyMap.get(monthKey);
          monthData.submissions += 1;
          if (submission.status === 'approved') {
            monthData.approvals += 1;
          }
        }
      });

      const monthlyStats = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        submissions: data.submissions,
        approvals: data.approvals
      }));

      setAnalytics({
        totalTasks,
        activeTasks,
        completedTasks,
        pendingSubmissions,
        approvalRate,
        categoryStats,
        monthlyStats
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{analytics.activeTasks}</div>
            <div className="text-sm text-muted-foreground">Active Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">{analytics.pendingSubmissions}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{analytics.approvalRate}%</div>
            <div className="text-sm text-muted-foreground">Approval Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="submissions" fill="#8884d8" />
                <Bar dataKey="approvals" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
