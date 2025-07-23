import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { OnboardingFlow } from '@/components/dashboard/OnboardingFlow';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { ReferralTab } from '@/components/dashboard/ReferralTab';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { useDashboard } from '@/hooks/useDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { isOnboardingComplete } = useOnboarding();
  
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

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <DashboardHeader 
          userStats={userStats} 
          userProfile={userProfile} 
        />
        
        <StatsCards 
          userStats={userStats}
          totalPointsEarned={totalPointsEarned}
          withdrawalStats={withdrawalStats}
        />

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TasksTab 
              userTasks={userTasks}
              completedTasks={completedTasks}
              onTaskUpdate={loadUserData}
            />
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <ReferralTab />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <WalletTab />
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
