import React, { useState } from "react";
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
import { 
  Trophy, 
  Users, 
  Bell, 
  Gift,
  TrendingUp,
  Award,
  Star,
  Target,
  FileText,
  Smartphone,
  PenTool,
  Share2,
  Search
} from "lucide-react";

const Dashboard = () => {
  const [userStats] = useState({
    points: 2450,
    level: 12,
    tasksCompleted: 38,
    currentStreak: 5,
    rank: 142,
    referrals: 3
  });

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

  // Mock data for task categories - updated to match TaskCategory interface
  const [categories] = useState([
    { 
      id: "survey", 
      name: "Surveys", 
      description: "Share your opinions and feedback on various topics",
      icon: <FileText className="h-6 w-6" />,
      taskCount: 15, 
      averagePoints: 50,
      color: "text-blue-400"
    },
    { 
      id: "app_testing", 
      name: "App Testing", 
      description: "Test mobile apps and websites for usability issues",
      icon: <Smartphone className="h-6 w-6" />,
      taskCount: 8, 
      averagePoints: 100,
      color: "text-green-400"
    },
    { 
      id: "content_creation", 
      name: "Content Creation", 
      description: "Create reviews, write descriptions, or generate content",
      icon: <PenTool className="h-6 w-6" />,
      taskCount: 12, 
      averagePoints: 150,
      color: "text-purple-400"
    },
    { 
      id: "social_media", 
      name: "Social Media", 
      description: "Engage with brands on social platforms",
      icon: <Share2 className="h-6 w-6" />,
      taskCount: 20, 
      averagePoints: 75,
      color: "text-pink-400"
    },
    { 
      id: "research", 
      name: "Research", 
      description: "Participate in market research and data collection",
      icon: <Search className="h-6 w-6" />,
      taskCount: 5, 
      averagePoints: 200,
      color: "text-yellow-400"
    }
  ]);

  // Mock data for completed tasks
  const [completedTasks] = useState([
    {
      id: "1",
      title: "Complete Product Survey",
      description: "Share your feedback on our new product features",
      points: 50,
      category: "survey",
      difficulty: "easy",
      brand_name: "TechCorp",
      brand_logo_url: "",
      completed_at: "2024-01-15T10:30:00Z",
      points_earned: 50
    },
    {
      id: "2", 
      title: "Test Mobile App",
      description: "Test the new mobile app and report any bugs",
      points: 100,
      category: "app_testing",
      difficulty: "medium",
      brand_name: "AppStudio",
      brand_logo_url: "",
      completed_at: "2024-01-14T14:20:00Z",
      points_earned: 100
    }
  ]);

  // Task counts for filter
  const taskCounts = {
    available: 45,
    in_progress: 3,
    completed: completedTasks.length,
    total: 50
  };

  const totalPointsEarned = completedTasks.reduce((sum, task) => sum + task.points_earned, 0);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Ready to earn some rewards?
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
                <TaskCategories
                  categories={categories}
                  onCategorySelect={handleCategorySelect}
                />
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
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span>Survey completed</span>
                        <span className="text-muted-foreground">+50 pts</span>
                      </div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span>Social media share</span>
                        <span className="text-muted-foreground">+25 pts</span>
                      </div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <span>Referral bonus</span>
                        <span className="text-muted-foreground">+100 pts</span>
                      </div>
                      <div className="text-xs text-muted-foreground">2 days ago</div>
                    </div>
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
              completedTasks={completedTasks}
              totalPointsEarned={totalPointsEarned}
              totalTasksCompleted={completedTasks.length}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
