import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBrandCampaigns } from '@/hooks/useBrandCampaigns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, MousePointer } from 'lucide-react';

export const BrandAnalytics = () => {
  const { campaigns } = useBrandCampaigns();

  // Mock analytics data based on campaigns
  const campaignPerformanceData = campaigns?.map(campaign => ({
    name: campaign.title.substring(0, 15) + '...',
    budget: Number(campaign.budget),
    reach: Math.floor(Math.random() * 10000) + 1000,
    engagement: Math.floor(Math.random() * 1000) + 100,
    conversions: Math.floor(Math.random() * 100) + 10
  })) || [];

  const monthlySpendData = [
    { month: 'Jan', spend: 15000, campaigns: 3 },
    { month: 'Feb', spend: 22000, campaigns: 4 },
    { month: 'Mar', spend: 18000, campaigns: 2 },
    { month: 'Apr', spend: 25000, campaigns: 5 },
    { month: 'May', spend: 30000, campaigns: 6 },
    { month: 'Jun', spend: 28000, campaigns: 4 }
  ];

  const campaignStatusData = [
    { name: 'Active', value: campaigns?.filter(c => c.status === 'active').length || 0, color: '#10B981' },
    { name: 'Draft', value: campaigns?.filter(c => c.status === 'draft').length || 0, color: '#F59E0B' },
    { name: 'Completed', value: campaigns?.filter(c => c.status === 'completed').length || 0, color: '#3B82F6' },
    { name: 'Paused', value: campaigns?.filter(c => c.status === 'paused').length || 0, color: '#EF4444' }
  ];

  const totalMetrics = {
    totalReach: campaignPerformanceData.reduce((sum, item) => sum + item.reach, 0),
    totalEngagement: campaignPerformanceData.reduce((sum, item) => sum + item.engagement, 0),
    avgEngagementRate: campaignPerformanceData.length ? 
      (campaignPerformanceData.reduce((sum, item) => sum + (item.engagement / item.reach * 100), 0) / campaignPerformanceData.length) : 0,
    totalConversions: campaignPerformanceData.reduce((sum, item) => sum + item.conversions, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalReach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.avgEngagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySpendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Spend']} />
                <Line type="monotone" dataKey="spend" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaignStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {campaignStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={campaignPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reach" fill="hsl(var(--primary))" name="Reach" />
              <Bar dataKey="engagement" fill="hsl(var(--secondary))" name="Engagement" />
              <Bar dataKey="conversions" fill="hsl(var(--accent))" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};