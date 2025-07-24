
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp,
  Bell,
  Template,
  BarChart3,
  Settings,
  Calendar,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandCampaignsList } from '@/components/brand/BrandCampaignsList';
import { BrandNotifications } from '@/components/brand/BrandNotifications';
import { CampaignAnalytics } from '@/components/brand/CampaignAnalytics';
import { CampaignTemplates } from '@/components/brand/CampaignTemplates';

export const BrandDashboard = () => {
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

  const { data: wallet } = useQuery({
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Brand Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {profile?.company_name || 'Brand'}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Template className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                      <p className="text-2xl font-bold">{pendingCampaigns}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                      <p className="text-2xl font-bold">${wallet?.balance?.toLocaleString() || '0'}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
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
                      <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Campaigns</span>
                      <span className="font-medium">{campaigns?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="font-medium">{completedCampaigns}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-medium">
                        {campaigns?.length > 0 ? Math.round((completedCampaigns / campaigns.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Spent</span>
                      <span className="font-medium">${wallet?.total_spent?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <BrandCampaignsList />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics />
          </TabsContent>

          <TabsContent value="templates">
            <CampaignTemplates />
          </TabsContent>

          <TabsContent value="notifications">
            <BrandNotifications />
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Wallet Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">${wallet?.balance?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Deposited</p>
                    <p className="text-2xl font-bold">${wallet?.total_deposited?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">${wallet?.total_spent?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button>Add Funds</Button>
                  <Button variant="outline">Transaction History</Button>
                </div>
              </CardContent>
            </Card>
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
