
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useDashboard } from '@/hooks/useDashboard';

import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { ReferralTab } from '@/components/dashboard/ReferralTab';
import { SocialTab } from '@/components/dashboard/SocialTab';
import { Target, Wallet, Users, MessageCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
    userStats,
    userTasks,
    userSubmissions,
    totalPointsEarned,
    withdrawalStats,
    loading,
    error,
    loadUserData
  } = useDashboard();

  // Get active tab from URL params, default to 'tasks'
  const activeTab = searchParams.get('tab') || 'tasks';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground">
              You need to be signed in to access your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadUserData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your activity overview.
          </p>
        </div>

        <DashboardStats 
          userStats={userStats} 
          totalPointsEarned={totalPointsEarned}
          withdrawalStats={withdrawalStats}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Referral</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <TasksTab
              userStats={userStats}
              userTasks={userTasks}
              userSubmissions={userSubmissions}
              loadUserData={loadUserData}
            />
          </TabsContent>

          <TabsContent value="wallet" className="mt-6">
            <WalletTab />
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <ReferralTab />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <SocialTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
