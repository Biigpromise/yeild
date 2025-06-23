
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { StoriesTab } from "@/components/dashboard/StoriesTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { AchievementsTab } from "@/components/dashboard/AchievementsTab";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { HistoryTab } from "@/components/dashboard/HistoryTab";
import { CommunityChatTab } from "@/components/dashboard/CommunityChatTab";
import { UserSearchTab } from "@/components/dashboard/UserSearchTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { DesktopTabNavigation } from "@/components/dashboard/DesktopTabNavigation";
import { MobileTabNavigation } from "@/components/ui/mobile-tab-navigation";
import { useDashboard } from "@/hooks/useDashboard";
import { LoadingState } from "@/components/ui/loading-state";
import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState("tasks");
  const {
    userProfile,
    userStats,
    loading,
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loadUserData
  } = useDashboard();

  useEffect(() => {
    if (role === 'brand') {
      navigate('/brand-dashboard');
    }
  }, [role, navigate]);

  const handleProfileUpdate = () => {
    loadUserData();
  };

  if (loading) {
    return <LoadingState />;
  }

  // Default task counts
  const defaultTaskCounts = {
    available: 0,
    in_progress: 0,
    completed: completedTasks?.length || 0,
    total: 0
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "tasks":
        return (
          <TasksTab 
            searchQuery=""
            onSearchChange={() => {}}
            selectedCategory="all"
            onCategoryChange={() => {}}
            selectedDifficulty="all"
            onDifficultyChange={() => {}}
            selectedStatus="all"
            onStatusChange={() => {}}
            taskCounts={defaultTaskCounts}
            onClearFilters={() => {}}
            handleCategorySelect={() => {}}
            setActiveTab={setActiveTab}
            userStats={userStats}
            userTasks={[]}
          />
        );
      case "stories":
        return <StoriesTab />;
      case "profile":
        return (
          <ProfileTab
            userProfile={userProfile}
            userStats={userStats}
            totalPointsEarned={totalPointsEarned}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "referrals":
        return <ReferralsTab />;
      case "achievements":
        return <AchievementsTab userStats={userStats} />;
      case "leaderboard":
        return <LeaderboardTab />;
      case "wallet":
        return (
          <WalletTab 
            loading={false}
            userPoints={userStats.points}
            totalEarned={totalPointsEarned}
            pendingWithdrawals={withdrawalStats.pendingWithdrawals}
            completedWithdrawals={withdrawalStats.completedWithdrawals}
            onRefresh={loadUserData}
          />
        );
      case "rewards":
        return (
          <RewardsTab 
            userPoints={userStats.points}
            onRedemption={loadUserData}
          />
        );
      case "history":
        return (
          <HistoryTab
            completedTasks={completedTasks}
            totalPointsEarned={totalPointsEarned}
          />
        );
      case "community":
        return <CommunityChatTab />;
      case "search":
        return <UserSearchTab />;
      case "support":
        return <SupportTab />;
      default:
        return (
          <TasksTab 
            searchQuery=""
            onSearchChange={() => {}}
            selectedCategory="all"
            onCategoryChange={() => {}}
            selectedDifficulty="all"
            onDifficultyChange={() => {}}
            selectedStatus="all"
            onStatusChange={() => {}}
            taskCounts={defaultTaskCounts}
            onClearFilters={() => {}}
            handleCategorySelect={() => {}}
            setActiveTab={setActiveTab}
            userStats={userStats}
            userTasks={[]}
          />
        );
    }
  };

  // Special layout for community chat - full screen
  if (activeTab === "community") {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="h-screen flex flex-col">
          <CommunityChatTab />
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DashboardHeader user={userProfile} />

        <DashboardStats userStats={userStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <DesktopTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Add bottom padding on mobile to prevent content from being hidden behind the fixed navigation */}
            <div className="pb-32 lg:pb-0">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <MobileTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
