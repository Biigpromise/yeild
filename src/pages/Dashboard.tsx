import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import TaskHistory from "@/components/TaskHistory";
import { Leaderboard } from "@/components/Leaderboard";
import { ReferralSystem } from "@/components/ReferralSystem";
import { RewardsStore } from "@/components/rewards/RewardsStore";
import { AchievementsList } from "@/components/achievements/AchievementsList";
import { RedemptionHistory } from "@/components/rewards/RedemptionHistory";
import { WithdrawalForm } from "@/components/wallet/WithdrawalForm";
import { WithdrawalHistory } from "@/components/wallet/WithdrawalHistory";
import { WalletOverview } from "@/components/wallet/WalletOverview";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { MobileTabNavigation } from "@/components/ui/mobile-tab-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CommunityChatTab } from "@/components/dashboard/CommunityChatTab";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { HistoryTab } from "@/components/dashboard/HistoryTab";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";
import { ReferralsTab } from "@/components/dashboard/ReferralsTab";
import { RewardsTab } from "@/components/dashboard/RewardsTab";
import { TasksTab } from "@/components/dashboard/TasksTab";
import { WalletTab } from "@/components/dashboard/WalletTab";
import { AchievementsTab } from "@/components/dashboard/AchievementsTab";
import { SupportTab } from "@/components/dashboard/SupportTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { UserSearchTab } from "@/components/dashboard/UserSearchTab";
import { DesktopTabNavigation } from "@/components/dashboard/DesktopTabNavigation";
import { StoryReel } from "@/components/stories";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    user,
    userProfile,
    userStats,
    userTasks,
    userSubmissions,
    withdrawalStats,
    loading,
    loadUserData,
  } = useDashboard();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");

  // Real notifications from database - will be empty for new users
  const [notifications, setNotifications] = useState<any[]>([]);

  // Task filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Touch gesture navigation
  const tabs = ['tasks', 'rewards', 'achievements', 'wallet', 'leaderboard', 'profile', 'user-search', 'community-chat', 'support'];
  
  const handleSwipeLeft = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const gestureRef = useTouchGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    enabled: isMobile
  });

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // Calculate task counts from real data
  const taskCounts = {
    available: 0, // Will be populated from real data
    in_progress: userSubmissions.filter(s => s.status === 'pending').length,
    completed: userTasks.length,
    total: 0
  };

  const totalPointsEarned = userTasks.reduce((sum, task) => sum + (task.points_earned || 0), 0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div 
      ref={gestureRef}
      className={cn(
        "min-h-screen bg-background",
        isMobile ? "pb-20" : "pb-4"
      )}
    >
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
        {/* Compact Header */}
        <div className="mb-3 sm:mb-4">
          <DashboardHeader
            userProfile={userProfile}
            user={user}
            unreadCount={unreadCount}
            isNotificationsOpen={isNotificationsOpen}
            setIsNotificationsOpen={setIsNotificationsOpen}
            handleLogout={handleLogout}
            setActiveTab={setActiveTab}
          />

          {/* Real User Stats */}
          <DashboardStats userStats={userStats} />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          {/* Desktop Tab Navigation */}
          {!isMobile && <DesktopTabNavigation />}

          <TabsContent value="tasks" className="space-y-4 mt-3">
            <StoryReel />
            <TasksTab
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              taskCounts={taskCounts}
              onClearFilters={handleClearFilters}
              handleCategorySelect={handleCategorySelect}
              setActiveTab={setActiveTab}
              userStats={userStats}
              userTasks={userTasks}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsTab userPoints={userStats.points} onRedemption={loadUserData} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsTab userStats={userStats} />
          </TabsContent>

          <TabsContent value="wallet">
            <WalletTab 
              loading={loading}
              userPoints={userStats.points}
              totalEarned={totalPointsEarned}
              pendingWithdrawals={withdrawalStats.pendingWithdrawals}
              completedWithdrawals={withdrawalStats.completedWithdrawals}
              onWithdrawalSubmitted={loadUserData}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab
              userProfile={userProfile}
              userStats={userStats}
              totalPointsEarned={totalPointsEarned}
              onProfileUpdate={loadUserData}
            />
          </TabsContent>

          <TabsContent value="user-search">
            <UserSearchTab />
          </TabsContent>

          <TabsContent value="community-chat">
            <CommunityChatTab />
          </TabsContent>

          <TabsContent value="support">
            <SupportTab />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab
              completedTasks={userTasks}
              totalPointsEarned={totalPointsEarned}
            />
          </TabsContent>

          {/* Mobile Tab Navigation */}
          <MobileTabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
