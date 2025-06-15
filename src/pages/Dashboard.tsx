
import React, { useState, useEffect } from "react";
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
import { DashboardSkeleton, WalletSkeleton } from "@/components/ui/dashboard-skeleton";
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
import { taskService } from "@/services/taskService";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Trophy, 
  Users, 
  Bell, 
  Gift,
  TrendingUp,
  Award,
  Star,
  Target,
  LogOut,
  User,
  Wallet,
  ChevronDown,
  Home,
  Calendar,
  Clock,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    points: 0,
    level: 1,
    tasksCompleted: 0,
    currentStreak: 0,
    rank: 0,
    referrals: 0
  });
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [withdrawalStats, setWithdrawalStats] = useState({
    pendingWithdrawals: 0,
    completedWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
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
  const tabs = ['tasks', 'rewards', 'achievements', 'wallet', 'leaderboard', 'community-chat', 'support'];
  
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

  // Fetch user data
  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }
      
      setUserProfile(profile);
      setUserStats(prev => ({
        ...prev,
        points: profile.points || 0,
        level: profile.level || 1,
        tasksCompleted: profile.tasks_completed || 0
      }));

      // Fetch user tasks and submissions
      const [tasksData, submissionsData] = await Promise.all([
        taskService.getUserTasks(),
        taskService.getUserSubmissions()
      ]);
      
      setUserTasks(tasksData);
      setUserSubmissions(submissionsData);

      // Fetch withdrawal stats
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawals) {
        const pending = withdrawals
          .filter(w => w.status === 'pending' || w.status === 'approved')
          .reduce((sum, w) => sum + w.amount, 0);
        const completed = withdrawals
          .filter(w => w.status === 'completed')
          .reduce((sum, w) => sum + w.amount, 0);
        
        setWithdrawalStats({
          pendingWithdrawals: pending,
          completedWithdrawals: completed
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

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
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="tasks">
                <Home className="h-4 w-4 mr-2" />
                Home
              </TabsTrigger>
              <TabsTrigger value="rewards">
                <Gift className="h-4 w-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <Award className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="community-chat">
                 <MessageCircle className="h-4 w-4 mr-2" />
                 Community Chat
              </TabsTrigger>
              <TabsTrigger value="support">
                 <LifeBuoy className="h-4 w-4 mr-2" />
                 Support
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="tasks" className="space-y-4 mt-3">
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
