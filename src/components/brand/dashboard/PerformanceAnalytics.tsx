
import React from 'react';
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
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Eye,
  MousePointer
} from 'lucide-react';

interface PerformanceData {
  period: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
  status: 'top' | 'good' | 'underperforming';
}

interface AnalyticsProps {
  performanceData: PerformanceData[];
  campaignPerformance: CampaignPerformance[];
  audienceData: Array<{ name: string; value: number; color: string }>;
}

const PerformanceChart: React.FC<{ data: PerformanceData[] }> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
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
            <Line type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="conversions" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const CampaignLeaderboard: React.FC<{ campaigns: CampaignPerformance[] }> = ({ campaigns }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'top': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Top Performer</Badge>;
      case 'good': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Good</Badge>;
      case 'underperforming': return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Needs Attention</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'top': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'good': return <Target className="h-4 w-4 text-blue-600" />;
      case 'underperforming': return <Eye className="h-4 w-4 text-red-600" />;
      default: return <MousePointer className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Campaign Performance Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.slice(0, 5).map((campaign, index) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                {getStatusIcon(campaign.status)}
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{campaign.roi}% ROI</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{campaign.impressions.toLocaleString()} impressions</p>
                  <p>{campaign.clicks.toLocaleString()} clicks • {campaign.conversions} conversions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AudienceBreakdown: React.FC<{ data: Array<{ name: string; value: number; color: string }> }> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Audience Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value.toLocaleString(), 'Engagements']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-sm">{segment.name}: {segment.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const PerformanceAnalytics: React.FC<AnalyticsProps> = ({
  performanceData,
  campaignPerformance,
  audienceData
}) => {
  return (
    <div className="space-y-6">
      {/* Performance Trends */}
      <PerformanceChart data={performanceData} />

      {/* Campaign Leaderboard & Audience Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignLeaderboard campaigns={campaignPerformance} />
        <AudienceBreakdown data={audienceData} />
      </div>
    </div>
  );
};
