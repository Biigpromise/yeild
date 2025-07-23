
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

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

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
  }, [setSearchParams]);

  // Memoize tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'tasks':
        return <TasksTab userStats={userStats} />;
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
      case 'settings':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
            <SettingsTab />
          </div>
        );
      default:
        return (
          <>
            <SimplifiedDashboardStats userStats={userStats} />
            <DashboardCTA />
            <DashboardProgress userStats={userStats} />
          </>
        );
    }
  }, [activeTab, userStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen">
        <DashboardErrorFallback 
          error={error} 
          onRetry={loadUserData}
        />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <DashboardErrorBoundary>
        <div className="bg-background min-h-screen text-foreground">
          <DashboardHeader user={user} onTabChange={handleTabChange} />
          
          <div className="max-w-md mx-auto px-4 py-6">
            <DashboardNavTabs activeTab={activeTab} onTabChange={handleTabChange} />
            {tabContent}
          </div>
        </div>
      </DashboardErrorBoundary>
    </ThemeProvider>
  );
};

export default Dashboard;
