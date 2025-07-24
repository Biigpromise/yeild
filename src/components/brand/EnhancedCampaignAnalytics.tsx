import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DateRangeSelector, DateRange } from './DateRangeSelector';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Target, 
  DollarSign,
  Calendar,
  Activity,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { subDays } from 'date-fns';

export const EnhancedCampaignAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data: campaigns, isLoading: campaignLoading } = useQuery({
    queryKey: ['brand-campaigns', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['campaign-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select('*')
        .gte('recorded_at', dateRange.from.toISOString())
        .lte('recorded_at', dateRange.to.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isLoading = campaignLoading || analyticsLoading;

  // Enhanced mock data with more realistic metrics
  const performanceData = [
    { 
      name: 'Week 1', 
      impressions: 15200, 
      clicks: 890, 
      conversions: 42, 
      spent: 8500,
      ctr: 5.86,
      cpc: 9.55,
      cpa: 202.38
    },
    { 
      name: 'Week 2', 
      impressions: 18400, 
      clicks: 1240, 
      conversions: 58, 
      spent: 12800,
      ctr: 6.74,
      cpc: 10.32,
      cpa: 220.69
    },
    { 
      name: 'Week 3', 
      impressions: 21200, 
      clicks: 1580, 
      conversions: 76, 
      spent: 15600,
      ctr: 7.45,
      cpc: 9.87,
      cpa: 205.26
    },
    { 
      name: 'Week 4', 
      impressions: 19800, 
      clicks: 1450, 
      conversions: 69, 
      spent: 14200,
      ctr: 7.32,
      cpc: 9.79,
      cpa: 205.80
    },
  ];

  const campaignTypesData = [
    { name: 'Social Media', value: campaigns?.filter(c => {
      const req = c.requirements as any;
      return req?.type === 'social_media';
    }).length || 12, color: '#3B82F6', spent: 45000 },
    { name: 'Influencer', value: campaigns?.filter(c => {
      const req = c.requirements as any;
      return req?.type === 'influencer';
    }).length || 8, color: '#10B981', spent: 38000 },
    { name: 'Content Creation', value: campaigns?.filter(c => {
      const req = c.requirements as any;
      return req?.type === 'content';
    }).length || 15, color: '#F59E0B', spent: 52000 },
    { name: 'Brand Awareness', value: campaigns?.filter(c => {
      const req = c.requirements as any;
      return req?.type === 'awareness';
    }).length || 6, color: '#EF4444', spent: 28000 },
  ];

  const totalBudget = campaigns?.reduce((sum, campaign) => sum + Number(campaign.budget), 0) || 163000;
  const totalSpent = campaigns?.reduce((sum, campaign) => sum + (Number(campaign.funded_amount) || 0), 0) || 142500;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 8;
  const totalImpressions = performanceData.reduce((sum, data) => sum + data.impressions, 0);
  const totalClicks = performanceData.reduce((sum, data) => sum + data.clicks, 0);
  const totalConversions = performanceData.reduce((sum, data) => sum + data.conversions, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
  const avgCPC = totalClicks > 0 ? (totalSpent / totalClicks) : 0;
  const avgCPA = totalConversions > 0 ? (totalSpent / totalConversions) : 0;
  const roas = totalConversions > 0 ? ((totalConversions * 2500) / totalSpent) * 100 : 0; // Assuming avg order value of ₦2500

  const handleExportData = () => {
    // Mock export functionality
    const csvData = performanceData.map(item => 
      Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')
    ).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-analytics.csv';
    a.click();
  };

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
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12.5% vs last period</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click-Through Rate</p>
                <p className="text-2xl font-bold">{avgCTR.toFixed(2)}%</p>
                <p className="text-xs text-green-600">+0.8% vs last period</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROAS</p>
                <p className="text-2xl font-bold">{roas.toFixed(1)}%</p>
                <p className="text-xs text-yellow-600">-2.1% vs last period</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Cost Per Click</p>
                <p className="text-lg font-bold">₦{avgCPC.toFixed(2)}</p>
              </div>
              <Badge variant="secondary">CPC</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost Per Acquisition</p>
                <p className="text-lg font-bold">₦{avgCPA.toFixed(2)}</p>
              </div>
              <Badge variant="secondary">CPA</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-lg font-bold">{totalConversions}</p>
              </div>
              <Badge variant="secondary">CVR</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="impressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="clicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.dataKey}: {entry.value?.toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="impressions" stroke="#3B82F6" fill="url(#impressions)" />
              <Area type="monotone" dataKey="clicks" stroke="#10B981" fill="url(#clicks)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Campaign Types & Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={campaignTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="spent"
                >
                  {campaignTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {campaignTypesData.map((type, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="text-sm">{type.name}: {type.value} campaigns</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversions" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-bold">
                  {((totalConversions / totalClicks) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-lg font-bold">{totalConversions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};