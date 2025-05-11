
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  estimatedTime: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  status: "available" | "in_progress" | "completed" | "expired";
  expiresIn?: string;
  type: string;
  brand?: {
    name: string;
    logo?: string;
  };
}

const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Complete a short survey about social media habits",
    description: "Answer 10 questions about how you use different social media platforms.",
    points: 50,
    estimatedTime: "5 min",
    category: "Survey",
    difficulty: "easy",
    status: "available",
    type: "survey",
    brand: {
      name: "SocialX",
      logo: "https://via.placeholder.com/50"
    }
  },
  {
    id: "t2",
    title: "Test a new mobile game and provide feedback",
    description: "Download the game, play for at least 15 minutes, and answer specific questions about your experience.",
    points: 200,
    estimatedTime: "25 min",
    category: "App Testing",
    difficulty: "medium",
    status: "available",
    expiresIn: "2 days",
    type: "app-test",
    brand: {
      name: "GameSphere",
      logo: "https://via.placeholder.com/50"
    }
  },
  {
    id: "t3",
    title: "Create a short unboxing video of a product",
    description: "Record a 1-minute unboxing video showing your first impressions of the product.",
    points: 350,
    estimatedTime: "40 min",
    category: "Content Creation",
    difficulty: "hard",
    status: "available",
    expiresIn: "5 days",
    type: "content",
    brand: {
      name: "TechGadgets",
      logo: "https://via.placeholder.com/50"
    }
  },
  {
    id: "t4",
    title: "Write a product review for an eco-friendly water bottle",
    description: "Try the product for 3 days and write a detailed review highlighting pros and cons.",
    points: 150,
    estimatedTime: "20 min",
    category: "Review",
    difficulty: "medium",
    status: "available",
    type: "review",
    brand: {
      name: "EcoLife",
      logo: "https://via.placeholder.com/50"
    }
  },
  {
    id: "t5",
    title: "Participate in a virtual focus group about food delivery",
    description: "Join a 30-minute Zoom meeting to discuss your experiences with food delivery services.",
    points: 400,
    estimatedTime: "35 min",
    category: "Focus Group",
    difficulty: "medium",
    status: "available",
    expiresIn: "2 days",
    type: "meeting",
    brand: {
      name: "FoodDash",
      logo: "https://via.placeholder.com/50"
    }
  },
];

const leaderboardData = [
  { id: "u1", name: "Sarah Johnson", points: 12450, level: 8, avatar: "https://i.pravatar.cc/150?img=1" },
  { id: "u2", name: "Alex Martinez", points: 10200, level: 7, avatar: "https://i.pravatar.cc/150?img=3" },
  { id: "u3", name: "Taylor Wilson", points: 9875, level: 7, avatar: "https://i.pravatar.cc/150?img=5" },
  { id: "u4", name: "Jamie Smith", points: 8930, level: 6, avatar: "https://i.pravatar.cc/150?img=7" },
  { id: "u5", name: "Casey Wong", points: 7650, level: 6, avatar: "https://i.pravatar.cc/150?img=9" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState(leaderboardData);
  const [activeTab, setActiveTab] = useState("tasks");
  const [activeLevelTab, setActiveLevelTab] = useState("levels");
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();

  // Progress to next level calculation
  const pointsToNextLevel = userProfile ? (userProfile.level * 500) : 500;
  const currentProgress = userProfile ? userProfile.points % pointsToNextLevel : 0;
  const progressPercentage = (currentProgress / pointsToNextLevel) * 100;

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("yeild-user");
    
    if (!storedUser) {
      // Redirect to login if no user found
      toast.error("Please login to access the dashboard");
      navigate("/login");
      return;
    }
    
    try {
      const user = JSON.parse(storedUser) as UserProfile;
      setUserProfile({
        ...user,
        avatar: user.avatar || "https://i.pravatar.cc/150?img=18"
      });
    } catch (error) {
      console.error("Error parsing user data", error);
      localStorage.removeItem("yeild-user");
      navigate("/login");
    }

    // Add current user to leaderboard for demo
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Insert user into appropriate position in leaderboard based on points
      const updatedLeaderboard = [...leaderboardData];
      
      const userEntry = {
        id: user.id,
        name: user.name,
        points: user.points,
        level: user.level,
        avatar: user.avatar || "https://i.pravatar.cc/150?img=18"
      };
      
      // Find position for user and insert them
      let inserted = false;
      for (let i = 0; i < updatedLeaderboard.length; i++) {
        if (userEntry.points > updatedLeaderboard[i].points) {
          updatedLeaderboard.splice(i, 0, userEntry);
          inserted = true;
          break;
        }
      }
      
      // If not inserted yet, add to the end
      if (!inserted) {
        updatedLeaderboard.push(userEntry);
      }
      
      setLeaderboard(updatedLeaderboard);
    }
  }, [navigate]);

  const handleLogout = () => {
    // In a real app, call logout API
    localStorage.removeItem("yeild-user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Function to handle accepting a task
  const handleAcceptTask = (taskId: string) => {
    // Update task status
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: "in_progress" } : task
      )
    );
    
    toast.success("Task accepted! Start working on it now.");
  };

  // Function to handle completing a task (simplified for demo)
  const handleCompleteTask = (taskId: string) => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    
    if (!task || !userProfile) return;
    
    // Update task status
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, status: "completed" } : t
      )
    );
    
    // Update user profile
    const updatedProfile = {
      ...userProfile,
      points: userProfile.points + task.points,
      tasks_completed: userProfile.tasks_completed + 1
    };
    
    // Check if user leveled up
    const currentLevel = userProfile.level;
    const pointsForNextLevel = currentLevel * 500;
    
    if (updatedProfile.points >= pointsForNextLevel + userProfile.points % pointsForNextLevel) {
      updatedProfile.level += 1;
      toast.success("🎉 Level Up! You are now level " + updatedProfile.level);
    }
    
    setUserProfile(updatedProfile);
    localStorage.setItem("yeild-user", JSON.stringify(updatedProfile));
    
    toast.success(`Task completed! Earned ${task.points} points.`);
  };

  // If no user logged in, show loading or redirect (handled in useEffect)
  if (!userProfile) {
    return <div className="min-h-screen flex items-center justify-center bg-yeild-black">Loading...</div>;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/20 text-green-400";
      case "medium": return "bg-blue-500/20 text-blue-400";
      case "hard": return "bg-purple-500/20 text-purple-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTaskStatusBadge = (status: string) => {
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
                <img src={userProfile.avatar} alt={userProfile.name} />
              </Avatar>
              <div>
                <p className="font-medium truncate">{userProfile.name}</p>
                <p className="text-sm text-gray-400">Level {userProfile.level}</p>
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
                <p className="text-gray-400 text-sm hidden md:block">Welcome back, {userProfile.name}</p>
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
                <img src={userProfile.avatar} alt={userProfile.name} />
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
                  <p className="text-2xl font-bold text-yeild-yellow">{userProfile.points}</p>
                </div>
                <div className="bg-yeild-yellow/20 p-2 rounded-lg">
                  <Star className="h-6 w-6 text-yeild-yellow" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Progress to Level {userProfile.level + 1}</span>
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
                  <p className="text-2xl font-bold">{userProfile.tasks_completed}</p>
                </div>
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex text-sm text-gray-400">
                <span>{tasks.filter(t => t.status === "available").length} tasks available</span>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="yeild-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Earnings</h3>
                  <p className="text-2xl font-bold">${(userProfile.points * 0.01).toFixed(2)}</p>
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
                  <p className="text-2xl font-bold">{userProfile.level}</p>
                </div>
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="flex text-sm text-gray-400">
                <span>{500 - currentProgress} points until next level</span>
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
                          {getTaskStatusBadge(task.status)}
                          <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
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
                        <span>{task.estimatedTime}</span>
                      </div>
                      
                      {task.expiresIn && (
                        <div className="text-sm text-gray-400">
                          Expires in {task.expiresIn}
                        </div>
                      )}
                    </div>
                    
                    {task.brand && (
                      <div className="flex items-center mt-2 mb-4">
                        <div className="h-6 w-6 bg-gray-800 rounded-full overflow-hidden mr-2">
                          <img src={task.brand.logo} alt={task.brand.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm text-gray-300">{task.brand.name}</span>
                      </div>
                    )}
                    
                    <div className="mt-auto">
                      {task.status === "available" ? (
                        <Button 
                          className="w-full yeild-btn-primary"
                          onClick={() => handleAcceptTask(task.id)}
                        >
                          Accept Task
                        </Button>
                      ) : task.status === "in_progress" ? (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Mark Complete
                        </Button>
                      ) : task.status === "completed" ? (
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
                            ${(userProfile.points * 0.01).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {userProfile.points} points
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
                                <div className="text-sm text-gray-400">May 5, 2025</div>
                              </div>
                            </div>
                            <div className="text-green-400">+$0.50</div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center">
                              <div className="bg-green-500/20 p-2 rounded-full mr-3">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <div className="font-medium">Task Completion: App Test</div>
                                <div className="text-sm text-gray-400">May 3, 2025</div>
                              </div>
                            </div>
                            <div className="text-green-400">+$2.00</div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center">
                              <div className="bg-yeild-yellow/20 p-2 rounded-full mr-3">
                                <ArrowRight className="h-4 w-4 text-yeild-yellow" />
                              </div>
                              <div>
                                <div className="font-medium">Referral Bonus</div>
                                <div className="text-sm text-gray-400">April 28, 2025</div>
                              </div>
                            </div>
                            <div className="text-yeild-yellow">+$1.00</div>
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
