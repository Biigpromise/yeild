
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  DollarSign,
  Shield,
  TrendingUp,
  Target
} from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

import { TaskSubmissionsManager } from './TaskSubmissionsManager';


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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                      <span className="font-medium">Real-time data</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Task Completion Rate</span>
                      <span className="font-medium">Real-time data</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Brand Satisfaction</span>
                      <span className="font-medium">Real-time data</span>
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
                      <span className="font-medium">Real-time data</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'users':
        return (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real user management interface coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'brands':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Brand Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real brand management interface coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'campaigns':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real campaign management interface coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'submissions':
        return <TaskSubmissionsManager />;
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real analytics dashboard coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'financial':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financial Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real financial management interface coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real notification management interface coming soon.</p>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Real platform settings interface coming soon.</p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'brands' && 'Brand Management'}
              {activeTab === 'campaigns' && 'Campaign Management'}
              {activeTab === 'submissions' && 'Task Submissions'}
              {activeTab === 'analytics' && 'Analytics & Reports'}
              {activeTab === 'financial' && 'Financial Management'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'settings' && 'Platform Settings'}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === 'overview' && 'Monitor your platform performance and key metrics'}
              {activeTab === 'users' && 'Manage user accounts, roles, and permissions'}
              {activeTab === 'brands' && 'Oversee brand applications and profiles'}
              {activeTab === 'campaigns' && 'Review and manage brand campaigns'}
              {activeTab === 'submissions' && 'Review and approve task submissions'}
              {activeTab === 'analytics' && 'View detailed analytics and generate reports'}
              {activeTab === 'financial' && 'Manage payments, revenue, and financial operations'}
              {activeTab === 'notifications' && 'Send and manage platform notifications'}
              {activeTab === 'settings' && 'Configure platform settings and preferences'}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
