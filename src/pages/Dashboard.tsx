
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { ReferralsTab } from '@/components/dashboard/ReferralsTab';
import { LeaderboardTab } from '@/components/dashboard/LeaderboardTab';
import { SocialTab } from '@/components/dashboard/SocialTab';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useOnboarding } from '@/hooks/useOnboarding';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const { showOnboarding, userType, completeOnboarding } = useOnboarding();
  const {
    userProfile,
    userStats,
    userTasks,
    userSubmissions,
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loading,
    error,
    loadUserData
  } = useDashboard();

  // Set active tab from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        userType={userType} 
        onComplete={completeOnboarding}
      />
    );
  }

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert className="bg-red-900/20 border-red-500/30 text-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={loadUserData} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader user={user} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Bird Status Display */}
        <BirdStatusDisplay />
        
        {/* Stats Cards */}
        <StatsCards 
          userStats={userStats}
          totalPointsEarned={totalPointsEarned}
          withdrawalStats={withdrawalStats}
        />
        
        {/* Error Alert */}
        {error && (
          <Alert className="bg-yellow-900/20 border-yellow-500/30 text-yellow-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error} - Some features may not work correctly.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Wallet
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Referral
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Social
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-yeild-yellow data-[state=active]:text-black text-gray-300">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TasksTab 
              userStats={userStats}
              userTasks={userTasks}
              loadUserData={loadUserData}
            />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <WalletTab />
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardTab />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <SocialTab />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
