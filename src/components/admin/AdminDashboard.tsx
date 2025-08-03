
import React, { useState } from 'react';
import { ModernAdminLayout } from './ModernAdminLayout';
import { AdminOverview } from './simple/AdminOverview';
import { TaskManagement } from './TaskManagement';
import { AdminCampaignsSimple } from './simple/AdminCampaignsSimple';
import { AdminUsersSimple } from './simple/AdminUsersSimple';
import { AdminSystemHealth } from './simple/AdminSystemHealth';
import { AdminAnalytics } from './analytics/AdminAnalytics';
import { AdminFinancial } from './financial/AdminFinancial';
import { AdminNotifications } from './notifications/AdminNotifications';
import { AdminSettings } from './settings/AdminSettings';
import { AdminUserActions } from './AdminUserActions';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsersSimple />;
      case 'tasks':
        return <TaskManagement />;
      case 'campaigns':
        return <AdminCampaignsSimple />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'financial':
        return <AdminFinancial />;
      case 'notifications':
        return <AdminNotifications />;
      case 'actions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <p className="text-muted-foreground">Frequently used admin actions and shortcuts</p>
            </div>
            <AdminUserActions />
          </div>
        );
      case 'settings':
        return <AdminSettings />;
      case 'system':
        return <AdminSystemHealth />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <ModernAdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </ModernAdminLayout>
  );
};
