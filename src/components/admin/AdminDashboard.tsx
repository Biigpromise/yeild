
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  BarChart3, 
  DollarSign, 
  Settings, 
  Bell,
  Target,
  AlertTriangle
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { AdminBrands } from './AdminBrands';
import { AdminAnalytics } from './analytics/AdminAnalytics';
import { AdminFinancial } from './financial/AdminFinancial';
import { AdminNotifications } from './notifications/AdminNotifications';
import { AdminSettings } from './settings/AdminSettings';
import { EnhancedTaskManagement } from './enhanced/EnhancedTaskManagement';
import { AdminUserActions } from './AdminUserActions';
import { AdminSignOutMenu } from './AdminSignOutMenu';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Listen for navigation events from AdminUserActions
  React.useEffect(() => {
    const handleNavigateToUsers = () => {
      setActiveTab('users');
    };

    window.addEventListener('navigateToUsers', handleNavigateToUsers);
    return () => window.removeEventListener('navigateToUsers', handleNavigateToUsers);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive platform management and analytics
            </p>
          </div>
          <AdminSignOutMenu />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Brands</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                <AdminUserActions />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
                <AdminAnalytics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="brands">
            <AdminBrands />
          </TabsContent>

          <TabsContent value="tasks">
            <EnhancedTaskManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="financial">
            <AdminFinancial />
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
