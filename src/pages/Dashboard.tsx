import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Layout, 
  Menu, 
  Home, 
  LayoutGrid, 
  Wallet, 
  Award, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { TutorialButton } from "@/components/TutorialButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  points: number | null;
  level: number | null;
  tasks_completed: number | null;
  avatar_url?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  estimated_time: string | null;
  category: string | null;
  difficulty: string | null;
  status: string | null;
  expires_at?: string | null;
  task_type: string | null;
  brand_name?: string | null;
  brand_logo_url?: string | null;
  user_task_status?: "available" | "in_progress" | "completed" | "expired";
}

const leaderboardData = [
  { id: "u1", name: "Sarah Johnson", points: 12450, level: 8, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "u2", name: "Alex Martinez", points: 10200, level: 7, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "u3", name: "Taylor Wilson", points: 9875, level: 7, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "u4", name: "Jamie Smith", points: 8930, level: 6, avatar: "https://i.pravatar.cc/150?img=7" },
  { id: "u5", name: "Casey Wong", points: 7650, level: 6, avatar: "https://i.pravatar.cc/150?img=9" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState(leaderboardData);
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeLevelTab, setActiveLevelTab] = useState("levels");
  const [loading, setLoading] = useState(true);
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();

  // Progress to next level calculation
  const pointsToNextLevel = userProfile ? ((userProfile.level || 1) * 500) : 500;
  const currentProgress = userProfile ? (userProfile.points || 0) % pointsToNextLevel : 0;
  const progressPercentage = (currentProgress / pointsToNextLevel) * 100;

  useEffect(() => {
    if (!user) {
      toast.error("Please login to access the dashboard");
      navigate("/login");
      return;
    }

    fetchUserProfile();
    fetchTasks();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              points: 0,
              level: 1,
              tasks_completed: 0
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast.error("Failed to load user profile");
          return;
        }

        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;

    try {
      // Fetch all active tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'active');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        toast.error("Failed to load tasks");
        return;
      }

      // Fetch user task progress
      const { data: userTasksData, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id);

      if (userTasksError) {
        console.error('Error fetching user tasks:', userTasksError);
      }

      // Combine tasks with user progress
      const tasksWithProgress: Task[] = tasksData.map(task => {
        const userTask = userTasksData?.find(ut => ut.task_id === task.id);
        const taskStatus = userTask?.status || 'available';
        
        return {
          ...task,
          user_task_status: taskStatus as "available" | "in_progress" | "completed" | "expired"
        };
      });

      setTasks(tasksWithProgress);
    } catch (error) {
      console.error('Tasks fetch error:', error);
      toast.error("Failed to load tasks");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  // Function to handle accepting a task
  const handleAcceptTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .insert([
          {
            user_id: user.id,
            task_id: taskId,
            status: 'in_progress',
            started_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error accepting task:', error);
        toast.error("Failed to accept task");
        return;
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, user_task_status: "in_progress" } : task
        )
      );
      
      toast.success("Task accepted! Start working on it now.");
    } catch (error) {
      console.error('Accept task error:', error);
      toast.error("Failed to accept task");
    }
  };

  // Function to handle completing a task
  const handleCompleteTask = async (taskId: string) => {
    if (!user || !userProfile) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      // Update user task status
      const { error: taskError } = await supabase
        .from('user_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          points_earned: task.points
        })
        .eq('user_id', user.id)
        .eq('task_id', taskId);

      if (taskError) {
        console.error('Error completing task:', taskError);
        toast.error("Failed to complete task");
        return;
      }

      // Update user profile with new points and tasks completed
      const newPoints = (userProfile.points || 0) + task.points;
      const newTasksCompleted = (userProfile.tasks_completed || 0) + 1;
      const currentLevel = userProfile.level || 1;
      const pointsForNextLevel = currentLevel * 500;
      const newLevel = newPoints >= pointsForNextLevel ? currentLevel + 1 : currentLevel;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          points: newPoints,
          tasks_completed: newTasksCompleted,
          level: newLevel
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error("Task completed but failed to update profile");
        return;
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, user_task_status: "completed" } : t
        )
      );
      
      setUserProfile(prev => prev ? {
        ...prev,
        points: newPoints,
        tasks_completed: newTasksCompleted,
        level: newLevel
      } : null);

      if (newLevel > currentLevel) {
        toast.success(`🎉 Level Up! You are now level ${newLevel}`);
      }
      
      toast.success(`Task completed! Earned ${task.points} points.`);
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error("Failed to complete task");
    }
  };

  // If loading or no user profile, show loading
  if (loading || !userProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-yeild-black">Loading...</div>;
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-400";
      case "medium": return "bg-blue-500/20 text-blue-400";
      case "hard": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTaskStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "available": 
        return <Badge className="bg-yeild-yellow text-yeild-black">Available</Badge>;
      case "in_progress": 
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed": 
        return <Badge className="bg-green-500">Completed</Badge>;
      case "expired": 
        return <Badge variant="outline" className="text-gray-400 border-gray-400">Expired</Badge>;
      default: 
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-yeild-black flex">
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-gray-900 border-r border-gray-800">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-yeild-yellow text-2xl font-bold hidden md:block">YEILD</span>
              <span className="text-yeild-yellow text-xl font-bold md:hidden">Y</span>
            </div>
          </div>
          
          {/* Profile summary */}
          <div className="p-4 border-b border-gray-800 hidden md:block">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-yeild-yellow">
                <img src={userProfile.avatar_url || "https://i.pravatar.cc/150?img=18"} alt={userProfile.name || "User"} />
              </Avatar>
              <div>
                <p className="font-medium truncate">{userProfile.name || "User"}</p>
                <p className="text-sm text-gray-400">Level {userProfile.level || 1}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-gray-800 hover:text-yeild-yellow"
                onClick={() => navigate("/dashboard")}
              >
                <Home className="h-5 w-5 mr-3 md:mr-4" />
                <span className="hidden md:block">Dashboard</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'tasks' ? 'bg-gray-800 text-yeild-yellow' : 'text-white hover:bg-gray-800 hover:text-yeild-yellow'}`}
                onClick={() => setActiveTab("tasks")}
              >
                <LayoutGrid className="h-5 w-5 mr-3 md:mr-4" />
                <span className="hidden md:block">Tasks</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'wallet' ? 'bg-gray-800 text-yeild-yellow' : 'text-white hover:bg-gray-800 hover:text-yeild-yellow'}`}
                onClick={() => setActiveTab("wallet")}
              >
                <Wallet className="h-5 w-5 mr-3 md:mr-4" />
                <span className="hidden md:block">Wallet</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'leaderboard' ? 'bg-gray-800 text-yeild-yellow' : 'text-white hover:bg-gray-800 hover:text-yeild-yellow'}`}
                onClick={() => setActiveTab("leaderboard")}
              >
                <Award className="h-5 w-5 mr-3 md:mr-4" />
                <span className="hidden md:block">Leaderboard</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${activeTab === 'referrals' ? 'bg-gray-800 text-yeild-yellow' : 'text-white hover:bg-gray-800 hover:text-yeild-yellow'}`}
                onClick={() => setActiveTab("referrals")}
              >
                <Users className="h-5 w-5 mr-3 md:mr-4" />
                <span className="hidden md:block">Referrals</span>
              </Button>
            </nav>
          </div>

          {/* Settings and Logout */}
          <div className="p-2 border-t border-gray-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-yeild-yellow"
              onClick={startOnboarding}
            >
              <Settings className="h-5 w-5 mr-3 md:mr-4" />
              <span className="hidden md:block">
                {hasCompletedOnboarding ? "Restart Tutorial" : "Settings"}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-yeild-yellow"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3 md:mr-4" />
              <span className="hidden md:block">Logout</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold hidden md:block">Dashboard</h1>
                <p className="text-gray-400 text-sm hidden md:block">Welcome back, {userProfile.name || "User"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-10 bg-gray-800 border-gray-700 focus:border-yeild-yellow w-64"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-yeild-yellow">
                <Bell className="h-5 w-5" />
              </Button>
              
              {/* Tutorial Button */}
              <TutorialButton className="hidden md:flex" />
              
              {/* Profile Menu (simplified) */}
              <Avatar className="h-8 w-8 cursor-pointer border-2 border-yeild-yellow">
                <img src={userProfile.avatar_url || "https://i.pravatar.cc/150?img=18"} alt={userProfile.name || "User"} />
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Points Card */}
            <div className="yeild-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Total Points</h3>
                  <p className="text-2xl font-bold text-yeild-yellow">{userProfile.points || 0}</p>
                </div>
                <div className="bg-yeild-yellow/20 p-2 rounded-lg">
                  <Star className="h-6 w-6 text-yeild-yellow" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Progress to Level {(userProfile.level || 1) + 1}</span>
                  <span>{currentProgress}/{pointsToNextLevel}</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-gray-800 [&>div]:bg-yeild-yellow" />
              </div>
            </div>

            {/* Tasks Card */}
            <div className="yeild-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Tasks Completed</h3>
                  <p className="text-2xl font-bold">{userProfile.tasks_completed || 0}</p>
                </div>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex text-sm text-gray-400">
                <span>{tasks.filter(t => t.user_task_status === "available").length} tasks available</span>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="yeild-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Earnings</h3>
                  <p className="text-2xl font-bold">${((userProfile.points || 0) * 0.01).toFixed(2)}</p>
                </div>
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Wallet className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+$2.50 this week</span>
              </div>
            </div>

            {/* Level Card */}
            <div className="yeild-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Current Level</h3>
                  <p className="text-2xl font-bold">{userProfile.level || 1}</p>
                </div>
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="flex text-sm text-gray-400">
                <span>{pointsToNextLevel - currentProgress} points until next level</span>
              </div>
            </div>
          </div>

          {/* Main Content based on active tab */}
          {activeTab === "tasks" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Available Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tab="tasks">
                {tasks.map((task) => (
                  <div key={task.id} className="yeild-card h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex gap-2 mb-2">
                          {getTaskStatusBadge(task.user_task_status || "available")}
                          <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty ? task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1) : 'Unknown'}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-bold mb-2">{task.title}</h3>
                      </div>
                      <div className="bg-yeild-yellow text-yeild-black font-bold px-3 py-1 rounded-lg text-sm">
                        {task.points} pts
                      </div>
                    </div>
                    
                    <p className="text-gray-400 mb-4 text-sm flex-grow">{task.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{task.estimated_time}</span>
                      </div>
                      
                      {task.expires_at && (
                        <div className="text-sm text-gray-400">
                          Expires soon
                        </div>
                      )}
                    </div>
                    
                    {task.brand_name && (
                      <div className="flex items-center mt-2 mb-4">
                        <div className="h-6 w-6 bg-gray-800 rounded-full overflow-hidden mr-2">
                          <img src={task.brand_logo_url || ''} alt={task.brand_name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm text-gray-300">{task.brand_name}</span>
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      {task.user_task_status === "available" ? (
                        <Button 
                          className="w-full yeild-btn-primary"
                          onClick={() => handleAcceptTask(task.id)}
                        >
                          Accept Task
                        </Button>
                      ) : task.user_task_status === "in_progress" ? (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Mark Complete
                        </Button>
                      ) : task.user_task_status === "completed" ? (
                        <Button 
                          disabled 
                          className="w-full bg-green-600 cursor-not-allowed text-white"
                        >
                          Completed
                        </Button>
                      ) : (
                        <Button 
                          disabled 
                          className="w-full bg-gray-700 cursor-not-allowed text-gray-300"
                        >
                          Expired
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {activeTab === "wallet" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Your Wallet</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tab="wallet">
                <div className="lg:col-span-2">
                  {/* Balance Card */}
                  <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-gray-800 mb-6">
                    <CardHeader>
                      <CardTitle>Balance</CardTitle>
                      <CardDescription>Your current balance and transaction history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div className="mb-6 md:mb-0">
                          <div className="text-sm text-gray-400">Available balance</div>
                          <div className="text-4xl font-bold text-yeild-yellow">
                            ${((userProfile.points || 0) * 0.01).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {userProfile.points || 0} points
                          </div>
                        </div>
                        
                        <div>
                          <Button className="yeild-btn-primary mb-2 w-full">
                            Withdraw Funds
                          </Button>
                          <Button variant="outline" className="w-full yeild-btn-secondary">
                            Convert Points
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                        <div className="space-y-4">
                          {/* Mock transactions */}
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center">
                              <div className="bg-green-500/20 p-2 rounded-full mr-3">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <div className="font-medium">Task Completion: Survey</div>
                                <div className="text-sm text-gray-400">Today</div>
                              </div>
                            </div>
                            <div className="text-green-400">+$0.50</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  {/* Withdrawal Methods */}
                  <Card className="bg-gray-900 border-gray-800 mb-6">
                    <CardHeader>
                      <CardTitle>Withdrawal Methods</CardTitle>
                      <CardDescription>Connect payment accounts to withdraw your earnings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800 hover:text-yeild-yellow">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M15 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M7 15H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Connect Bank Account</span>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800 hover:text-yeild-yellow">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                          <path d="M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M15 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Add Credit/Debit Card</span>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start border-gray-700 hover:bg-gray-800 hover:text-yeild-yellow">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                          <path d="M15.5 9C15.5 7.61929 13.8807 6 12.5 6C11.1193 6 9.5 7.61929 9.5 9C9.5 11.5 15.5 11.5 15.5 14C15.5 15.3807 13.8807 17 12.5 17C11.1193 17 9.5 15.3807 9.5 14" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12.5 6V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M12.5 20V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Connect PayPal</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
