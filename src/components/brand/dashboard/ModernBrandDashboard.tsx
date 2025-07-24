
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  BarChart3, 
  Brain, 
  Wallet,
  Settings,
  Plus,
  Bell,
  Search
} from 'lucide-react';
import { BrandDashboardOverview } from './BrandDashboardOverview';
import { SmartInsightsPanel } from './SmartInsightsPanel';
import { PerformanceAnalytics } from './PerformanceAnalytics';

interface ModernBrandDashboardProps {
  profile?: any;
  wallet?: any;
  onCreateCampaign: () => void;
  onAddFunds: () => void;
}

// Mock data - in a real app, this would come from your API
const mockMetrics = {
  totalSpent: 45200,
  activeCampaigns: 8,
  totalReach: 89400,
  avgROI: 147
};

const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    status: 'active' as const,
    budget: 15000,
    spent: 8500,
    performance: 'excellent' as const,
    roi: 185
  },
  {
    id: '2',
    title: 'Brand Awareness Campaign',
    status: 'active' as const,
    budget: 12000,
    spent: 9200,
    performance: 'good' as const,
    roi: 132
  },
  {
    id: '3',
    title: 'Product Feature Highlight',
    status: 'paused' as const,
    budget: 8000,
    spent: 3400,
    performance: 'average' as const,
    roi: 98
  }
];

const mockInsights = [
  {
    id: '1',
    type: 'optimization' as const,
    title: 'Optimize Budget Allocation',
    description: 'Your Summer Collection campaign is performing 40% better than average. Consider reallocating budget from underperforming campaigns.',
    priority: 'high' as const,
    actionLabel: 'Optimize Now',
    onAction: () => console.log('Optimize budget')
  },
  {
    id: '2',
    type: 'alert' as const,
    title: 'Campaign Spending Alert',
    description: 'Brand Awareness Campaign is spending faster than projected. Current pace will exhaust budget in 3 days.',
    priority: 'high' as const,
    actionLabel: 'Adjust Budget',
    onAction: () => console.log('Adjust budget')
  },
  {
    id: '3',
    type: 'opportunity' as const,
    title: 'New Audience Segment',
    description: 'We identified a high-converting audience segment (18-24 age group) with 23% higher engagement rates.',
    priority: 'medium' as const,
    actionLabel: 'Target Audience',
    onAction: () => console.log('Target new audience')
  }
];

const mockBudgetHealth = {
  totalBudget: 50000,
  spent: 21100,
  remaining: 28900,
  dailySpendRate: 1200,
  projectedRunout: 24
};

const mockPerformanceData = [
  { period: 'Week 1', impressions: 25400, clicks: 1580, conversions: 89, spend: 5200, roi: 142 },
  { period: 'Week 2', impressions: 31200, clicks: 2240, conversions: 134, spend: 7800, roi: 156 },
  { period: 'Week 3', impressions: 28900, clicks: 1950, conversions: 117, spend: 6900, roi: 148 },
  { period: 'Week 4', impressions: 33100, clicks: 2380, conversions: 142, spend: 8200, roi: 163 }
];

const mockCampaignPerformance = [
  {
    id: '1',
    name: 'Summer Collection Launch',
    impressions: 45600,
    clicks: 3200,
    conversions: 189,
    spend: 12400,
    roi: 185,
    status: 'top' as const
  },
  {
    id: '2',
    name: 'Brand Awareness Campaign',
    impressions: 38200,
    clicks: 2100,
    conversions: 98,
    spend: 9800,
    roi: 132,
    status: 'good' as const
  },
  {
    id: '3',
    name: 'Product Feature Highlight',
    impressions: 22100,
    clicks: 890,
    conversions: 34,
    spend: 5600,
    roi: 98,
    status: 'underperforming' as const
  }
];

const mockAudienceData = [
  { name: '18-24', value: 2890, color: '#3B82F6' },
  { name: '25-34', value: 4520, color: '#10B981' },
  { name: '35-44', value: 3100, color: '#F59E0B' },
  { name: '45+', value: 1890, color: '#EF4444' }
];

export const ModernBrandDashboard: React.FC<ModernBrandDashboardProps> = ({
  profile,
  wallet,
  onCreateCampaign,
  onAddFunds
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                {profile?.company_name?.charAt(0) || 'B'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile?.company_name || 'Brand Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Campaign Command Center
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                />
              </div>

              {/* Wallet Balance */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet Balance</p>
                      <p className="text-lg font-bold text-foreground">
                        ${wallet?.balance?.toLocaleString() || '10'}
                      </p>
                    </div>
                    <Button size="sm" onClick={onAddFunds}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>

              {/* Create Campaign */}
              <Button onClick={onCreateCampaign} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Command Center
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Hub
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <BrandDashboardOverview
              metrics={mockMetrics}
              campaigns={mockCampaigns}
              onCreateCampaign={onCreateCampaign}
              onAddFunds={onAddFunds}
              onViewAnalytics={() => setActiveTab('analytics')}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PerformanceAnalytics
              performanceData={mockPerformanceData}
              campaignPerformance={mockCampaignPerformance}
              audienceData={mockAudienceData}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <SmartInsightsPanel
              insights={mockInsights}
              budgetHealth={mockBudgetHealth}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Settings Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced campaign settings and preferences will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
