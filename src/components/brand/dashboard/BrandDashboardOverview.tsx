
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Users, 
  Zap,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'danger';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, status = 'good' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'danger': return 'text-red-600 dark:text-red-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  const getChangeColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10 ${getStatusColor()}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(change)}%
            </div>
            <p className="text-xs text-muted-foreground">vs last period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CampaignStatusProps {
  campaigns: Array<{
    id: string;
    title: string;
    status: 'active' | 'paused' | 'draft' | 'completed';
    budget: number;
    spent: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
    roi: number;
  }>;
}

const CampaignStatusBoard: React.FC<CampaignStatusProps> = ({ campaigns }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case 'paused': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Paused</Badge>;
      case 'draft': return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">Draft</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Completed</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'average': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Live Campaign Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.slice(0, 5).map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {getPerformanceIcon(campaign.performance)}
                <div>
                  <p className="font-medium">{campaign.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(campaign.status)}
                    <span className="text-sm text-muted-foreground">
                      ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">ROI: {campaign.roi}%</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round((campaign.spent / campaign.budget) * 100)}% spent
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickActionsProps {
  onCreateCampaign: () => void;
  onAddFunds: () => void;
  onViewAnalytics: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onCreateCampaign, onAddFunds, onViewAnalytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Button onClick={onCreateCampaign} className="w-full justify-between group">
            Create New Campaign
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button onClick={onAddFunds} variant="outline" className="w-full justify-between group">
            Add Funds to Wallet
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button onClick={onViewAnalytics} variant="outline" className="w-full justify-between group">
            View Detailed Analytics
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface BrandDashboardOverviewProps {
  metrics: {
    totalSpent: number;
    activeCampaigns: number;
    totalReach: number;
    avgROI: number;
  };
  campaigns: Array<{
    id: string;
    title: string;
    status: 'active' | 'paused' | 'draft' | 'completed';
    budget: number;
    spent: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
    roi: number;
  }>;
  onCreateCampaign: () => void;
  onAddFunds: () => void;
  onViewAnalytics: () => void;
}

export const BrandDashboardOverview: React.FC<BrandDashboardOverviewProps> = ({
  metrics,
  campaigns,
  onCreateCampaign,
  onAddFunds,
  onViewAnalytics
}) => {
  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Investment"
          value={`$${metrics.totalSpent.toLocaleString()}`}
          change={12.5}
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          status="good"
        />
        <MetricCard
          title="Active Campaigns"
          value={metrics.activeCampaigns.toString()}
          change={8.3}
          trend="up"
          icon={<Target className="h-5 w-5" />}
          status="good"
        />
        <MetricCard
          title="Total Reach"
          value={`${(metrics.totalReach / 1000).toFixed(1)}K`}
          change={15.7}
          trend="up"
          icon={<Users className="h-5 w-5" />}
          status="good"
        />
        <MetricCard
          title="Average ROI"
          value={`${metrics.avgROI}%`}
          change={-2.1}
          trend="down"
          icon={<TrendingUp className="h-5 w-5" />}
          status="warning"
        />
      </div>

      {/* Campaign Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampaignStatusBoard campaigns={campaigns} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions
            onCreateCampaign={onCreateCampaign}
            onAddFunds={onAddFunds}
            onViewAnalytics={onViewAnalytics}
          />
        </div>
      </div>
    </div>
  );
};
