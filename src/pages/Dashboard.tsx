
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
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
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { EnhancedNotificationCenter } from "@/components/dashboard/EnhancedNotificationCenter";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { DesktopTabNavigation } from "@/components/dashboard/DesktopTabNavigation";
import { MobileTabNavigation } from "@/components/ui/mobile-tab-navigation";
import { FeatureUnlockNotification } from "@/components/dashboard/FeatureUnlockNotification";
import { useDashboard } from "@/hooks/useDashboard";
import { useExperienceLevel } from "@/hooks/useExperienceLevel";
import { LoadingState } from "@/components/ui/loading-state";
import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState("tasks");
  const [showUnlockNotification, setShowUnlockNotification] = useState(false);
  const [previousTasksCompleted, setPreviousTasksCompleted] = useState(0);
  const {
    userProfile,
    userStats,
    loading,
    completedTasks,
    totalPointsEarned,
    withdrawalStats,
    loadUserData
  } = useDashboard();

  const { justUnlockedFeatures, currentTier, isFeatureUnlocked } = useExperienceLevel(
    userStats.tasksCompleted, 
    previousTasksCompleted,
    userProfile?.active_referrals_count || 0
  );

  useEffect(() => {
    if (role === 'brand') {
      navigate('/brand-dashboard');
    }
  }, [role, navigate]);

  // Track task completion changes and show unlock notifications
  useEffect(() => {
    if (userStats.tasksCompleted > previousTasksCompleted && justUnlockedFeatures.length > 0) {
      setShowUnlockNotification(true);
    }
    setPreviousTasksCompleted(userStats.tasksCompleted);
  }, [userStats.tasksCompleted, justUnlockedFeatures.length, previousTasksCompleted]);

  // Redirect to available tab if current tab is locked
  useEffect(() => {
    if (!isFeatureUnlocked(activeTab)) {
      setActiveTab("tasks"); // Always fallback to tasks (always unlocked)
    }
  }, [activeTab, isFeatureUnlocked]);

  const handleProfileUpdate = () => {
    loadUserData();
  };


  // Default task counts
  const defaultTaskCounts = {
    available: 0,
    in_progress: 0,
    completed: completedTasks?.length || 0,
    total: 0
  };

  const renderTabContent = () => {
    // Only render content if feature is unlocked
    if (!isFeatureUnlocked(activeTab)) {
      return (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Feature Locked</h2>
          <p className="text-muted-foreground">
            Complete more tasks to unlock this feature
          </p>
        </div>
      );
    }

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
      case "activity":
        return <ActivityFeed />;
      case "notifications":
        return <EnhancedNotificationCenter />;
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

  // Special layout for community chat - full viewport with proper bottom spacing
  if (activeTab === "community") {
    return (
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <CommunityChatTab />
          </div>
        </div>
        {/* Mobile Navigation with proper spacing */}
        <div className="lg:hidden flex-shrink-0 safe-area-bottom">
          <MobileTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tasksCompleted={userStats.tasksCompleted}
            referralsCount={userProfile?.active_referrals_count || 0}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <DashboardHeader user={userProfile} onTabChange={setActiveTab} />

        {activeTab === "tasks" && <DashboardSummaryCards userStats={userStats} />}
        <DashboardStats userStats={userStats} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <DesktopTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tasksCompleted={userStats.tasksCompleted}
              referralsCount={userProfile?.active_referrals_count || 0}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Add compact bottom padding on mobile to prevent content from being hidden behind the fixed navigation */}
            <div className="pb-20 lg:pb-0">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - more compact */}
        <div className="lg:hidden">
          <MobileTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tasksCompleted={userStats.tasksCompleted}
            referralsCount={userProfile?.active_referrals_count || 0}
          />
        </div>


        {/* Feature Unlock Notification */}
        <FeatureUnlockNotification
          isOpen={showUnlockNotification}
          onClose={() => setShowUnlockNotification(false)}
          unlockedFeatures={justUnlockedFeatures}
          newTier={currentTier}
        />

        {/* Onboarding Tutorial */}
        <OnboardingTutorial />
      </div>
    </div>
  );
};

export default Dashboard;
