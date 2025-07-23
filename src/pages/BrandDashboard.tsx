
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign,
  Plus,
  Settings,
  BarChart3,
  LogOut,
  Wallet,
  CreditCard,
  User,
  FileText,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBrandCampaignStats } from '@/hooks/useBrandCampaignStats';
import { BrandCampaignsTab } from '@/components/brand/BrandCampaignsTab';
import { BrandAnalyticsTab } from '@/components/brand/BrandAnalyticsTab';
import { BrandBillingTab } from '@/components/brand/BrandBillingTab';
import { BrandProfileTab } from '@/components/brand/BrandProfileTab';
import { BrandPerformanceTab } from '@/components/brand/BrandPerformanceTab';
import { BrandWalletCard } from '@/components/brand/BrandWalletCard';

const BrandDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useBrandCampaignStats();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is brand
  const isBrand = user?.user_metadata?.user_type === 'brand' || user?.user_metadata?.company_name;
  if (!user || !isBrand) {
    return <Navigate to="/dashboard" replace />;
  }

  const companyName = user.user_metadata?.company_name || user.user_metadata?.name || 'Brand Partner';

  return (
    <div className="min-h-screen bg-background">
      {/* Brand Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Brand Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {companyName}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Brand Partner
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/brand/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-muted">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-background">
              <Target className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-background">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Active Campaigns</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.activeCampaigns || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.campaignGrowth || 0} from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Reach</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : `${(stats?.totalReach || 0).toLocaleString()}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.reachGrowth || 0}% from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Engagement Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : `${stats?.engagementRate || 0}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.engagementGrowth || 0}% from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₦{statsLoading ? '...' : (stats?.totalSpent || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.spentGrowth || 0}% from last month`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Campaign Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Create and manage your marketing campaigns</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => navigate('/campaigns/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Campaign
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('campaigns')}>
                      <Target className="h-4 w-4 mr-2" />
                      View All Campaigns
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Analytics & Reports</CardTitle>
                  <p className="text-sm text-muted-foreground">Track your campaign performance</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab('performance')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Performance Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <BrandWalletCard />
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <BrandCampaignsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <BrandAnalyticsTab />
          </TabsContent>

          <TabsContent value="billing">
            <BrandBillingTab />
          </TabsContent>

          <TabsContent value="performance">
            <BrandPerformanceTab />
          </TabsContent>

          <TabsContent value="profile">
            <BrandProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrandDashboard;
