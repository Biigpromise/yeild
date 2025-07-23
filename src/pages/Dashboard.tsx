
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { SimplifiedDashboardStats } from '@/components/dashboard/SimplifiedDashboardStats';
import { DashboardNavTabs } from '@/components/dashboard/DashboardNavTabs';
import { DashboardCTA } from '@/components/dashboard/DashboardCTA';
import { DashboardProgress } from '@/components/dashboard/DashboardProgress';
import { DashboardErrorBoundary, DashboardErrorFallback } from '@/components/dashboard/DashboardErrorBoundary';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { ReferralsTab } from '@/components/dashboard/ReferralsTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { LeaderboardTab } from '@/components/dashboard/LeaderboardTab';
import { SocialTab } from '@/components/dashboard/SocialTab';
import { StoriesTab } from '@/components/dashboard/StoriesTab';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  
  const {
    userStats,
    loading,
    error,
    loadUserData
  } = useDashboard();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletTab />;
      case 'referral':
        return <ReferralsTab />;
      case 'profile':
        return <ProfileTab />;
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'social':
        return <SocialTab />;
      case 'stories':
        return <StoriesTab />;
      default:
        return (
          <>
            {/* Stats Grid */}
            <SimplifiedDashboardStats userStats={userStats} />
            
            {/* Central CTA */}
            <DashboardCTA />
            
            {/* Progress Section */}
            <DashboardProgress userStats={userStats} />
          </>
        );
    }
  };

  return (
    <DashboardErrorBoundary>
      <div className="bg-gray-900 min-h-screen text-white">
        {/* Dashboard Header with Bird Status and Logout */}
        <DashboardHeader user={user} onTabChange={handleTabChange} />
        
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Navigation Tabs */}
          <DashboardNavTabs activeTab={activeTab} onTabChange={handleTabChange} />
          
          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;
