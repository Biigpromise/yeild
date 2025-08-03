import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Award, DollarSign, 
  Activity, Calendar, Download, Building2, Shield 
} from 'lucide-react';
import { taskSourceAnalyticsService, TaskSourceAnalytics } from '@/services/taskSourceAnalyticsService';
import { toast } from 'sonner';

export const TaskSourceAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<TaskSourceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const data = await taskSourceAnalyticsService.getTaskSourceAnalytics({ 
        start: startDate, 
        end: endDate 
      });
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = analytics.metrics.map(metric => ({
      'Task Source': metric.taskSource,
      'Total Tasks': metric.totalTasks,
      'Active Tasks': metric.activeTasks,
      'Completed Tasks': metric.completedTasks,
      'Total Budget': metric.totalBudget,
      'Points Awarded': metric.totalPointsAwarded,
      'Completion Rate %': metric.avgCompletionRate.toFixed(2),
      'Avg Task Value': metric.avgTaskValue.toFixed(2)
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-source-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const pieChartData = analytics.metrics.map(metric => ({
    name: metric.taskSource === 'platform' ? 'Platform Tasks' : 'Brand Campaigns',
    value: metric.completedTasks,
    color: metric.taskSource === 'platform' ? '#3b82f6' : '#f97316'
  }));

  const trendData = analytics.trends.platform.map((platformData, index) => ({
    date: new Date(Date.now() - (analytics.trends.platform.length - index - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    platform: platformData.completedTasks,
    brand: analytics.trends.brandCampaign[index]?.completedTasks || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Source Analytics</h2>
          <p className="text-muted-foreground">Compare performance between Platform and Brand Campaign tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {analytics.metrics.map((metric) => (
          <Card key={metric.taskSource} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {metric.taskSource === 'platform' ? (
                    <Shield className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Building2 className="h-5 w-5 text-orange-500" />
                  )}
                  <span className="font-medium text-sm">
                    {metric.taskSource === 'platform' ? 'Platform' : 'Brand'}
                  </span>
                </div>
                <Badge variant={metric.taskSource === 'platform' ? 'secondary' : 'outline'}>
                  {metric.avgCompletionRate.toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{metric.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {metric.activeTasks} active of {metric.totalTasks} total
              </p>
              <div className="text-sm text-muted-foreground">
                ₦{metric.totalPointsAwarded.toLocaleString()} awarded
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Completion Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="platform" 
                  stroke="#3b82f6" 
                  name="Platform Tasks"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="brand" 
                  stroke="#f97316" 
                  name="Brand Campaigns"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Points Awarded */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget vs Points Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="taskSource" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalBudget" fill="#3b82f6" name="Total Budget" />
                <Bar dataKey="totalPointsAwarded" fill="#10b981" name="Points Awarded" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.performance.completionRates.platform.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Platform Rate</p>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Building2 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.performance.completionRates.brand_campaign.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Brand Rate</p>
              </div>
            </div>
            <div className="text-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Best Performing: {analytics.performance.bestPerforming === 'platform' ? 'Platform Tasks' : 'Brand Campaigns'}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Value: ₦{analytics.performance.totalValue.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};