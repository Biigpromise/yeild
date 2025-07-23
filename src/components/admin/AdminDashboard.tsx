
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  Shield,
  Building2,
  Megaphone,
  Settings,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { AdminSignOutMenu } from './AdminSignOutMenu';
import { EnhancedUserManagement } from './enhanced/EnhancedUserManagement';
import { EnhancedTaskManagement } from './enhanced/EnhancedTaskManagement';
import { EnhancedAnalytics } from './enhanced/EnhancedAnalytics';
import { EnhancedFinanceManagement } from './enhanced/EnhancedFinanceManagement';
import { FinancialDashboard } from './financial/FinancialDashboard';
import { AdminSettings } from './AdminSettings';
import { AdminBrands } from './AdminBrands';
import { BrandCampaigns } from './BrandCampaigns';
import { CampaignApprovalManager } from './CampaignApprovalManager';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useRecentActivities } from '@/hooks/useRecentActivities';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, loading: statsLoading } = useAdminStats();
  const { activities, loading: activitiesLoading } = useRecentActivities();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Administrator
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome to Admin Panel
              </span>
              <AdminSignOutMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-muted">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-background">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="brands" className="data-[state=active]:bg-background">
              <Building2 className="h-4 w-4 mr-2" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-background">
              <Megaphone className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-background">
              <Target className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="finance" className="data-[state=active]:bg-background">
              <CreditCard className="h-4 w-4 mr-2" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.totalUsers.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `${stats?.userGrowth > 0 ? '+' : ''}${stats?.userGrowth}% from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Active Tasks</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {statsLoading ? '...' : stats?.activeTasks || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `${stats?.taskGrowth > 0 ? '+' : ''}${stats?.taskGrowth}% from last month`}
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
                    {statsLoading ? '...' : `${stats?.engagementRate}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.engagementGrowth}% from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₦{statsLoading ? '...' : stats?.totalRevenue.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statsLoading ? '...' : `+${stats?.revenueGrowth}% from last month`}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activitiesLoading ? (
                      <div className="text-center text-muted-foreground">Loading activities...</div>
                    ) : activities.length > 0 ? (
                      activities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">No recent activities</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-5 w-5" />
                    System Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <span className="text-sm text-foreground">Server response time high</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Warning</Badge>
                      <span className="text-sm text-foreground">Low disk space on server</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Info</Badge>
                      <span className="text-sm text-foreground">Scheduled maintenance tomorrow</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <EnhancedUserManagement />
          </TabsContent>

          <TabsContent value="brands">
            <AdminBrands />
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Campaign Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Active Campaigns</h3>
                      <BrandCampaigns />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Pending Approvals</h3>
                      <CampaignApprovalManager />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <EnhancedTaskManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <EnhancedAnalytics />
          </TabsContent>

          <TabsContent value="finance">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
