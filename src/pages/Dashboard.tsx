
import React from 'react';
import { DesktopTabNavigation } from '@/components/dashboard/DesktopTabNavigation';
import { MobileTabNavigation } from '@/components/ui/mobile-tab-navigation';
import { TasksTab } from '@/components/dashboard/TasksTab';
import { RewardsTab } from '@/components/dashboard/RewardsTab';
import { AchievementsTab } from '@/components/dashboard/AchievementsTab';
import { WalletTab } from '@/components/dashboard/WalletTab';
import { LeaderboardTab } from '@/components/dashboard/LeaderboardTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { loading, userStats, userTasks, refreshData } = useDashboard();
  const [activeTab, setActiveTab] = React.useState('tasks');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const handleRedemption = () => {
    refreshData(); // Refresh user data after redemption
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <TasksTab 
            userStats={userStats} 
            userTasks={userTasks} 
            loadUserData={refreshData}
          />
        );
      case 'rewards':
        return (
          <RewardsTab 
            userPoints={userStats.points} 
            onRedemption={handleRedemption}
          />
        );
      case 'achievements':
        return <AchievementsTab userStats={userStats} />;
      case 'wallet':
        return <WalletTab userPoints={userStats.points} />;
      case 'leaderboard':
        return <LeaderboardTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return (
          <TasksTab 
            userStats={userStats} 
            userTasks={userTasks} 
            loadUserData={refreshData}
          />
        );
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6 max-w-md">
          {renderActiveTab()}
        </div>
        <MobileTabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          tasksCompleted={userStats.tasksCompleted}
          referralsCount={userStats.referrals}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <DesktopTabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              tasksCompleted={userStats.tasksCompleted}
              referralsCount={userStats.referrals}
            />
          </div>
          <div className="col-span-9">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
