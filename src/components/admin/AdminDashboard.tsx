
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  DollarSign,
  Shield,
  Settings,
  Bell,
  TrendingUp,
  Target,
  MessageSquare,
  CreditCard
} from 'lucide-react';

// Import existing components
import { AdminBrands } from './AdminBrands';
import { TaskSubmissionsManager } from './TaskSubmissionsManager';
import { BrandCampaignsManagement } from './brands/BrandCampaignsManagement';
import { AdminUsers } from './AdminUsers';
import { AdminFinancialOverview } from './AdminFinancialOverview';
import { AdminSettings } from './AdminSettings';
import { AdminNotifications } from './AdminNotifications';
import { AdminAnalytics } from './AdminAnalytics';


// Quick stats component with real data
const QuickStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get brand applications count
      const { count: brandsCount } = await supabase
        .from('brand_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get campaigns count
      const { count: campaignsCount } = await supabase
        .from('brand_campaigns')
        .select('*', { count: 'exact', head: true });

      // Get active campaigns count
      const { count: activeCampaignsCount } = await supabase
        .from('brand_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total revenue (sum of all brand wallets total_deposited)
      const { data: wallets } = await supabase
        .from('brand_wallets')
        .select('total_deposited');

      const totalRevenue = wallets?.reduce((sum, wallet) => sum + (wallet.total_deposited || 0), 0) || 0;

      return {
        totalUsers: usersCount || 0,
        activeBrands: brandsCount || 0,
        totalRevenue,
        activeCampaigns: activeCampaignsCount || 0,
        totalCampaigns: campaignsCount || 0,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</p>
              <p className="text-xs text-green-600">Platform members</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Brands</p>
              <p className="text-2xl font-bold">{stats?.activeBrands?.toLocaleString() || '0'}</p>
              <p className="text-xs text-green-600">Approved partners</p>
            </div>
            <Building2 className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₦{stats?.totalRevenue?.toLocaleString() || '0'}</p>
              <p className="text-xs text-green-600">Platform deposits</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
              <p className="text-2xl font-bold">{stats?.activeCampaigns?.toLocaleString() || '0'}</p>
              <p className="text-xs text-muted-foreground">of {stats?.totalCampaigns || 0} total</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, manage your platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              System Online
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <QuickStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Platform Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Daily Active Users</span>
                      <span className="font-medium">8,432</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Task Completion Rate</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Brand Satisfaction</span>
                      <span className="font-medium">4.8/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Server Status</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Database Health</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Response Time</span>
                      <span className="font-medium">120ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="brands">
            <AdminBrands />
          </TabsContent>

          <TabsContent value="campaigns">
            <BrandCampaignsManagement />
          </TabsContent>

          <TabsContent value="submissions">
            <TaskSubmissionsManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="financial">
            <AdminFinancialOverview />
          </TabsContent>

          <TabsContent value="notifications">
            <AdminNotifications />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
