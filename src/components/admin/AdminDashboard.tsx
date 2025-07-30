
import React, { useState } from 'react';
import { ModernAdminLayout } from './ModernAdminLayout';
import { UserManagement } from './UserManagement';
import { AdminBrands } from './AdminBrands';
import { AdminAnalytics } from './analytics/AdminAnalytics';
import { AdminFinancial } from './financial/AdminFinancial';
import { AdminNotifications } from './notifications/AdminNotifications';
import { AdminSettings } from './settings/AdminSettings';
import { EnhancedTaskManagement } from './enhanced/EnhancedTaskManagement';
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
        return (
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
        );
      case 'users':
        return <UserManagement />;
      case 'brands':
        return <AdminBrands />;
      case 'tasks':
        return <EnhancedTaskManagement />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'financial':
        return <AdminFinancial />;
      case 'notifications':
        return <AdminNotifications />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <ModernAdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </ModernAdminLayout>
  );
};
