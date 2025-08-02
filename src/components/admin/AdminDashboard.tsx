
import React, { useState } from 'react';
import { ModernAdminLayout } from './ModernAdminLayout';
import { AdminOverview } from './simple/AdminOverview';
import { AdminTasksSimple } from './simple/AdminTasksSimple';
import { AdminCampaignsSimple } from './simple/AdminCampaignsSimple';
import { AdminUsersSimple } from './simple/AdminUsersSimple';
import { AdminSystemHealth } from './simple/AdminSystemHealth';

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
        return <AdminTasksSimple />;
      case 'campaigns':
        return <AdminCampaignsSimple />;
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
