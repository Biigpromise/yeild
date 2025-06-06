
import React, { useState, useEffect } from "react";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import TaskHistory from "@/components/TaskHistory";
import { Leaderboard } from "@/components/Leaderboard";
import { ReferralSystem } from "@/components/ReferralSystem";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  User
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {userProfile?.name || user?.email}! Ready to earn some rewards?
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/profile"}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Browse Tasks
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{userStats.points.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.tasksCompleted}</div>
                <div className="text-xs text-muted-foreground">Tasks Done</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">#{userStats.rank}</div>
                <div className="text-xs text-muted-foreground">Rank</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">{userStats.referrals}</div>
                <div className="text-xs text-muted-foreground">Referrals</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
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
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Daily Check-in
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Gift className="h-4 w-4 mr-2" />
                      Claim Rewards
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userTasks.slice(0, 3).map((task, index) => (
                      <div key={task.id} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span>{task.tasks?.title || 'Task completed'}</span>
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

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralSystem />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="history">
            <TaskHistory
              completedTasks={userTasks}
              totalPointsEarned={totalPointsEarned}
              totalTasksCompleted={userTasks.length}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
