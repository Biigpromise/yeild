
import React, { useState } from 'react';
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
import { ChatTab } from '@/components/dashboard/ChatTab';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useOnboarding } from '@/hooks/useOnboarding';

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
    loadUserData
  } = useDashboard();

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        userType={userType} 
        onComplete={completeOnboarding}
      />
    );
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardHeader user={user} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <StatsCards 
          userStats={userStats}
          totalPointsEarned={totalPointsEarned}
          withdrawalStats={withdrawalStats}
        />
        
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
