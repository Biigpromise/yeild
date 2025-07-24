import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Target, 
  DollarSign, 
  TrendingUp,
  Bell,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  CreditCard,
  Calculator,
  Zap
} from 'lucide-react';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandCampaignsList } from '@/components/brand/BrandCampaignsList';
import { BrandNotifications } from '@/components/brand/BrandNotifications';
import { EnhancedCampaignAnalytics } from '@/components/brand/EnhancedCampaignAnalytics';
import { CampaignTemplates } from '@/components/brand/CampaignTemplates';
import { BrandDashboardHeader } from '@/components/brand/BrandDashboardHeader';
import { CampaignROICalculator } from '@/components/brand/CampaignROICalculator';
import { BrandWalletCard } from '@/components/brand/BrandWalletCard';

const BrandDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['brand-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const totalBudget = campaigns?.reduce((sum, campaign) => sum + Number(campaign.budget), 0) || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const pendingCampaigns = campaigns?.filter(c => c.admin_approval_status === 'pending').length || 0;
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BrandDashboardHeader
        profile={profile}
        wallet={wallet}
        onRefreshWallet={refetchWallet}
        onCreateCampaign={() => setIsCreateDialogOpen(true)}
      />
      
      <div className="container mx-auto p-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">ROI Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Budget</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">${totalBudget.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {wallet?.total_deposited ? ((totalBudget / wallet.total_deposited) * 100).toFixed(1) : 0}% allocated
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Campaigns</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeCampaigns}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {pendingCampaigns > 0 ? `+${pendingCampaigns} pending` : 'All approved'}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Wallet Balance</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${wallet?.balance?.toLocaleString() || '10'}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                        Available for campaigns
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Performance</p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {campaigns?.length > 0 ? Math.round((completedCampaigns / campaigns.length) * 100) : 0}%
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Success rate
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create New Campaign</h3>
                      <p className="text-sm text-muted-foreground">Launch your next marketing campaign</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-secondary/10 p-3 rounded-full">
                      <Calculator className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">ROI Calculator</h3>
                      <p className="text-sm text-muted-foreground">Estimate campaign performance</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => setActiveTab('calculator')}
                      className="w-full"
                    >
                      Calculate ROI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-accent/10 p-3 rounded-full">
                      <Zap className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">Quick Analytics</h3>
                      <p className="text-sm text-muted-foreground">View performance insights</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setActiveTab('analytics')}
                      className="w-full"
                    >
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recent Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns?.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(campaign.budget).toLocaleString()} • {new Date(campaign.created_at).toLocaleDateString()}
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
                    {(!campaigns || campaigns.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>No campaigns yet</p>
                        <p className="text-sm">Create your first campaign to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Total Campaigns</span>
                      <span className="font-bold">{campaigns?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Completed Successfully</span>
                      <span className="font-bold text-green-600">{completedCampaigns}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Total Invested</span>
                      <span className="font-bold">${wallet?.total_spent?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Available Balance</span>
                      <span className="font-bold text-blue-600">${wallet?.balance?.toLocaleString() || '10'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <BrandCampaignsList />
          </TabsContent>

          <TabsContent value="calculator">
            <CampaignROICalculator />
          </TabsContent>

          <TabsContent value="analytics">
            <EnhancedCampaignAnalytics />
          </TabsContent>

          <TabsContent value="templates">
            <CampaignTemplates />
          </TabsContent>

          <TabsContent value="notifications">
            <BrandNotifications />
          </TabsContent>

          <TabsContent value="wallet">
            <BrandWalletCard onBalanceUpdate={() => refetchWallet()} />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company Name</p>
                        <p className="font-medium">{profile?.company_name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium">{profile?.industry || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Website</p>
                        <p className="font-medium">{profile?.website || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{profile?.currency_preference || 'NGN'}</p>
                      </div>
                    </div>
                  </div>
                  <Button>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateCampaignDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default BrandDashboard;
