
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { SimplifiedDashboardStats } from '@/components/dashboard/SimplifiedDashboardStats';
import { DashboardNavTabs } from '@/components/dashboard/DashboardNavTabs';
import { DashboardCTA } from '@/components/dashboard/DashboardCTA';
import { DashboardProgress } from '@/components/dashboard/DashboardProgress';
import { DashboardErrorBoundary, DashboardErrorFallback } from '@/components/dashboard/DashboardErrorBoundary';

const Dashboard: React.FC = () => {
  const {
    userStats,
    loading,
    error,
    loadUserData
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-400" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <DashboardErrorFallback 
          error={error} 
          onRetry={loadUserData}
        />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-gray-400 text-sm">Welcome back! Here's your progress overview.</p>
          </div>
          
          {/* Stats Grid */}
          <SimplifiedDashboardStats userStats={userStats} />
          
          {/* Navigation Tabs */}
          <DashboardNavTabs activeTab="dashboard" />
          
          {/* Central CTA */}
          <DashboardCTA />
          
          {/* Progress Section */}
          <DashboardProgress userStats={userStats} />
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
