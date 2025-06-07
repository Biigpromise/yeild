
import React, { useState, useEffect } from "react";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import TaskHistory from "@/components/TaskHistory";
import { Leaderboard } from "@/components/Leaderboard";
import { ReferralSystem } from "@/components/ReferralSystem";
import { NotificationCenter } from "@/components/NotificationCenter";
import { RewardsStore } from "@/components/rewards/RewardsStore";
import { AchievementsList } from "@/components/achievements/AchievementsList";
import { RedemptionHistory } from "@/components/rewards/RedemptionHistory";
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
import { useAuth } from "@/contexts/AuthContext";
import { taskService } from "@/services/taskService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState(true);

  const [notifications] = useState([
    { id: 1, message: "New task available: Complete Survey", read: false },
    { id: 2, message: "Achievement unlocked: Early Bird", read: false },
    { id: 3, message: "Referral bonus: +100 points", read: true }
  ]);

  // Task filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-bold mb-1">Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, {userProfile?.name || user?.email}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="outline" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Browse Tasks Button */}
              <Button size="sm">
                <Target className="h-4 w-4 mr-1" />
                Browse Tasks
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Wallet className="h-4 w-4 mr-2" />
                    Wallet
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
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-primary">{userStats.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-purple-600">{userStats.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-green-600">{userStats.tasksCompleted}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-orange-600">{userStats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-blue-600">#{userStats.rank}</div>
                <div className="text-xs text-muted-foreground">Rank</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-2 text-center">
                <div className="text-lg font-bold text-pink-600">{userStats.referrals}</div>
                <div className="text-xs text-muted-foreground">Referrals</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-3">
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Wallet className="h-4 w-4" />
                      Current Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {userStats.points.toLocaleString()} Points
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ≈ ${(userStats.points / 100).toFixed(2)} USD
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Earned</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xl font-bold text-green-600 mb-1">
                      {totalPointsEarned.toLocaleString()} Points
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {userTasks.length} completed tasks
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <Button size="sm" className="w-full">
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Points
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <RedemptionHistory />
            </div>
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

          {/* Fixed Bottom Navigation - Facebook Style */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
            <TabsList className="w-full h-16 bg-background p-0 grid grid-cols-6 rounded-none border-0">
              <TabsTrigger 
                value="tasks" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </TabsTrigger>
              <TabsTrigger 
                value="rewards" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Gift className="h-5 w-5" />
                <span className="text-xs">Rewards</span>
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Award className="h-5 w-5" />
                <span className="text-xs">Achievements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="wallet" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs">Wallet</span>
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="referrals" 
                className="flex-col h-full gap-1 data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Referrals</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
