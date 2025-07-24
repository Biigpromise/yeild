
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Target, 
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';

interface CampaignAnalytic {
  id: string;
  campaign_id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  metadata: any;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
}

export const CampaignAnalytics = () => {
  const { data: campaigns, isLoading: campaignLoading } = useQuery({
    queryKey: ['brand-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as CampaignAnalytic[];
    },
  });

  const isLoading = campaignLoading || analyticsLoading;

  // Mock data for demonstration since we don't have real analytics yet
  const mockPerformanceData = [
    { name: 'Week 1', impressions: 1200, clicks: 89, conversions: 12 },
    { name: 'Week 2', impressions: 1800, clicks: 134, conversions: 18 },
    { name: 'Week 3', impressions: 2100, clicks: 167, conversions: 25 },
    { name: 'Week 4', impressions: 1900, clicks: 145, conversions: 21 },
  ];

  const mockCampaignStatus = [
    { name: 'Active', value: campaigns?.filter(c => c.status === 'active').length || 0, color: '#10B981' },
    { name: 'Draft', value: campaigns?.filter(c => c.status === 'draft').length || 0, color: '#F59E0B' },
    { name: 'Completed', value: campaigns?.filter(c => c.status === 'completed').length || 0, color: '#6B7280' },
  ];

  const totalBudget = campaigns?.reduce((sum, campaign) => sum + Number(campaign.budget), 0) || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalImpressions = mockPerformanceData.reduce((sum, data) => sum + data.impressions, 0);
  const totalClicks = mockPerformanceData.reduce((sum, data) => sum + data.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
                <p className="text-2xl font-bold">{ctr}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="Impressions" />
              <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Clicks" />
              <Line type="monotone" dataKey="conversions" stroke="#ffc658" name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Campaign Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockCampaignStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockCampaignStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {mockCampaignStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns?.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget: ${Number(campaign.budget).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={
                    campaign.status === 'active' ? 'default' :
                    campaign.status === 'draft' ? 'secondary' : 'outline'
                  }>
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
