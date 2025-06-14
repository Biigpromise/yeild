
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import TaskHistory from "@/components/TaskHistory";
import { Leaderboard } from "@/components/Leaderboard";
import { ReferralSystem } from "@/components/ReferralSystem";
import { NotificationCenter } from "@/components/NotificationCenter";
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
  Home
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
    currentStreak: 5,
    rank: 142,
    referrals: 3
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

  // Mock notifications data - in a real app this would come from an API
  const notifications = [
    { id: 1, title: "Task completed", message: "You earned 50 points!", read: false },
    { id: 2, title: "New achievement", message: "Congratulations on your streak!", read: true },
    { id: 3, title: "Withdrawal processed", message: "Your payout has been sent", read: false }
  ];

  // Task filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Touch gesture navigation
  const tabs = ['tasks', 'rewards', 'achievements', 'wallet', 'leaderboard', 'referrals'];
  
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

  // Calculate task counts
  const taskCounts = {
    available: 45, // This would come from a real API call
    in_progress: userSubmissions.filter(s => s.status === 'pending').length,
    completed: userTasks.length,
    total: 50
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
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold mb-1 truncate">Dashboard</h1>
              <p className="text-xs text-muted-foreground truncate">
                Welcome back, {userProfile?.name || user?.email}!
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Notifications */}
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 sm:w-96 p-0" align="end">
                  <NotificationCenter />
                </PopoverContent>
              </Popover>

              {/* Browse Tasks Button - Hidden on mobile */}
              {!isMobile && (
                <Button size="sm" onClick={() => navigate('/tasks')}>
                  <Target className="h-4 w-4 mr-1" />
                  Browse Tasks
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {!isMobile && <ChevronDown className="h-3 w-3" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/tasks')}>
                    <Target className="h-4 w-4 mr-2" />
                    Browse Tasks
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Compact Quick Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-primary">{userStats.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-purple-600">{userStats.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-green-600">{userStats.tasksCompleted}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-orange-600">{userStats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-blue-600">#{userStats.rank}</div>
                <div className="text-xs text-muted-foreground">Rank</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-sm sm:text-lg font-bold text-pink-600">{userStats.referrals}</div>
                <div className="text-xs text-muted-foreground">Referrals</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          {/* Desktop Tab Navigation */}
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="referrals">
                <Users className="h-4 w-4 mr-2" />
                Referrals
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="tasks" className="space-y-4 mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3 space-y-4">
                <TaskFilter
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
                />
                <TaskCategories onCategorySelect={handleCategorySelect} />
              </div>
              <div className="space-y-4">
                {/* Quick Actions */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <Button size="sm" className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Daily Check-in
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Rewards
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    {userTasks.slice(0, 3).map((task, index) => (
                      <div key={task.id} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="truncate">{task.tasks?.title || 'Task completed'}</span>
                          <span className="text-muted-foreground">+{task.points_earned || 0} pts</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    ))}
                    {userTasks.length === 0 && (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsStore userPoints={userStats.points} onRedemption={loadUserData} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsList userStats={userStats} />
          </TabsContent>

          <TabsContent value="wallet">
            {loading ? (
              <WalletSkeleton />
            ) : (
              <div className="space-y-6">
                <WalletOverview 
                  userPoints={userStats.points}
                  totalEarned={totalPointsEarned}
                  pendingWithdrawals={withdrawalStats.pendingWithdrawals}
                  completedWithdrawals={withdrawalStats.completedWithdrawals}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WithdrawalForm 
                    userPoints={userStats.points}
                    onWithdrawalSubmitted={loadUserData}
                  />
                  <WithdrawalHistory />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralSystem />
          </TabsContent>

          <TabsContent value="history">
            <TaskHistory
              completedTasks={userTasks}
              totalPointsEarned={totalPointsEarned}
              totalTasksCompleted={userTasks.length}
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
