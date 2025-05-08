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
            >
              <Settings className="h-5 w-5 mr-3 md:mr-4" />
              <span className="hidden md:block">Settings</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  
                  {/* Redeem Options */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Redeem Options</CardTitle>
                      <CardDescription>Convert your points to gift cards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-gray-800 rounded-lg text-center cursor-pointer hover:border hover:border-yeild-yellow transition-all">
                          <div className="text-xl mb-1">🛒</div>
                          <div className="text-sm font-medium">Amazon</div>
                          <div className="text-xs text-gray-400">1000 pts = $10</div>
                        </div>
                        
                        <div className="p-3 bg-gray-800 rounded-lg text-center cursor-pointer hover:border hover:border-yeild-yellow transition-all">
                          <div className="text-xl mb-1">🎮</div>
                          <div className="text-sm font-medium">Steam</div>
                          <div className="text-xs text-gray-400">1000 pts = $10</div>
                        </div>
                        
                        <div className="p-3 bg-gray-800 rounded-lg text-center cursor-pointer hover:border hover:border-yeild-yellow transition-all">
                          <div className="text-xl mb-1">☕</div>
                          <div className="text-sm font-medium">Starbucks</div>
                          <div className="text-xs text-gray-400">500 pts = $5</div>
                        </div>
                        
                        <div className="p-3 bg-gray-800 rounded-lg text-center cursor-pointer hover:border hover:border-yeild-yellow transition-all">
                          <div className="text-xl mb-1">🎬</div>
                          <div className="text-sm font-medium">Netflix</div>
                          <div className="text-xs text-gray-400">1500 pts = $15</div>
                        </div>
                      </div>
                      
                      <Button className="w-full yeild-btn-secondary mt-2">
                        View All Gift Cards
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
          
          {activeTab === "leaderboard" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Leaderboard</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Top Users */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Top YEILDers</CardTitle>
                      <CardDescription>Users with the highest points this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {leaderboard.map((user, index) => (
                          <div 
                            key={user.id} 
                            className={`flex justify-between items-center p-3 rounded-lg ${
                              user.id === userProfile.id 
                                ? 'bg-yeild-yellow/20 border border-yeild-yellow/40' 
                                : 'bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 flex items-center justify-center mr-4 font-bold">
                                {index + 1}
                              </div>
                              <Avatar className="mr-3">
                                <img src={user.avatar} alt={user.name} />
                              </Avatar>
                              <div>
                                <div className="font-medium flex items-center">
                                  {user.name}
                                  {user.id === userProfile.id && (
                                    <span className="text-xs ml-2 bg-yeild-yellow text-yeild-black px-2 py-0.5 rounded">You</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400">Level {user.level}</div>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-yeild-yellow">{user.points.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-800 flex justify-center">
                      <Button variant="link" className="text-yeild-yellow">
                        View Full Leaderboard
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div>
                  {/* Level Benefits */}
                  <Card className="bg-gray-900 border-gray-800 mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Levels & Benefits</CardTitle>
                        <div className="flex">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={`${activeLevelTab === 'levels' ? 'bg-gray-800' : ''}`}
                            onClick={() => setActiveLevelTab("levels")}
                          >
                            Levels
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={`${activeLevelTab === 'benefits' ? 'bg-gray-800' : ''}`}
                            onClick={() => setActiveLevelTab("benefits")}
                          >
                            Benefits
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activeLevelTab === "levels" ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-2">
                            <div className="font-medium">Your Level</div>
                            <div className="text-lg font-bold">{userProfile.level}</div>
                          </div>
                          
                          <Progress value={progressPercentage} className="h-2 bg-gray-800 [&>div]:bg-yeild-yellow" />
                          
                          <div className="text-sm text-gray-400 flex justify-between">
                            <span>{currentProgress} points</span>
                            <span>{pointsToNextLevel} points</span>
                          </div>
                          
                          {/* Level indicators */}
                          <div className="space-y-3 mt-4">
                            <div className={`p-3 rounded-lg flex justify-between items-center ${userProfile.level >= 1 ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                  <span>1</span>
                                </div>
                                <span>Starter</span>
                              </div>
                              <div className="text-sm text-gray-400">0 pts</div>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex justify-between items-center ${userProfile.level >= 2 ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center mr-3 text-blue-400">
                                  <span>2</span>
                                </div>
                                <span>Explorer</span>
                              </div>
                              <div className="text-sm text-gray-400">500 pts</div>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex justify-between items-center ${userProfile.level >= 5 ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center mr-3 text-purple-400">
                                  <span>5</span>
                                </div>
                                <span>Expert</span>
                              </div>
                              <div className="text-sm text-gray-400">2000 pts</div>
                            </div>
                            
                            <div className={`p-3 rounded-lg flex justify-between items-center ${userProfile.level >= 10 ? 'bg-gray-800' : 'bg-gray-900 opacity-60'}`}>
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-yeild-yellow/30 rounded-full flex items-center justify-center mr-3 text-yeild-yellow">
                                  <span>10</span>
                                </div>
                                <span>Elite</span>
                              </div>
                              <div className="text-sm text-gray-400">5000 pts</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="font-medium mb-2 flex items-center">
                              <Star className="h-4 w-4 text-yeild-yellow mr-2" /> 
                              Higher Task Payouts
                            </div>
                            <p className="text-sm text-gray-400">Earn up to 20% more points per task as you level up</p>
                          </div>
                          
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="font-medium mb-2 flex items-center">
                              <Award className="h-4 w-4 text-purple-400 mr-2" /> 
                              Exclusive Tasks
                            </div>
                            <p className="text-sm text-gray-400">Unlock higher-paying tasks only available at certain levels</p>
                          </div>
                          
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="font-medium mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-400 mr-2" /> 
                              Better Conversion Rates
                            </div>
                            <p className="text-sm text-gray-400">Get more value when converting points to cash or gift cards</p>
                          </div>
                          
                          <div className="p-3 bg-gray-800 rounded-lg">
                            <div className="font-medium mb-2 flex items-center">
                              <Users className="h-4 w-4 text-blue-400 mr-2" /> 
                              Higher Referral Bonuses
                            </div>
                            <p className="text-sm text-gray-400">Earn more from referrals as your level increases</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Achievements */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Your Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-2">
                            <Star className="h-5 w-5 text-yeild-yellow" />
                          </div>
                          <div className="text-xs text-center">First Task</div>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                            <Users className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="text-xs text-center">Referral</div>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg opacity-40">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-2">
                            <Award className="h-5 w-5 text-purple-400" />
                          </div>
                          <div className="text-xs text-center">Level 5</div>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg opacity-40">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </div>
                          <div className="text-xs text-center">10 Tasks</div>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg opacity-40">
                          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="text-xs text-center">Streak</div>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-gray-800 rounded-lg">
                          <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-dashed border-gray-600">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="text-xs text-center mt-2">View All</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
          
          {activeTab === "referrals" && (
            <>
              <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Referral Stats Card */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Referral Stats</CardTitle>
                      <CardDescription>Track your referral performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                          <div className="text-sm text-gray-400">Total Referrals</div>
                          <div className="text-2xl font-bold">1</div>
                        </div>
                        
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                          <div className="text-sm text-gray-400">Active Referrals</div>
                          <div className="text-2xl font-bold">1</div>
                        </div>
                        
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                          <div className="text-sm text-gray-400">Earnings</div>
                          <div className="text-2xl font-bold text-yeild-yellow">$1.00</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">Your Referral Link</h3>
                        <div className="flex">
                          <Input 
                            readOnly 
                            value="https://yeild.com/ref/user123" 
                            className="bg-gray-800 border-gray-700"
                          />
                          <Button className="ml-2 bg-gray-800 hover:bg-gray-700">
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recent Referrals</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center">
                              <Avatar className="mr-3">
                                <img src="https://i.pravatar.cc/150?img=36" alt="Referred User" />
                              </Avatar>
                              <div>
                                <div className="font-medium">Chris Williams</div>
                                <div className="text-sm text-gray-400">Joined Apr 20, 2025</div>
                              </div>
                            </div>
                            <div className="text-yeild-yellow">$1.00</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Referral History Chart (mock) */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Referral History</CardTitle>
                      <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60 flex items-center justify-center border-b border-gray-800 mb-4">
                        <div className="text-center text-gray-400">
                          <div className="text-5xl mb-2">📊</div>
                          <p>Referral activity will appear here</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button variant="outline" className="yeild-btn-secondary">
                          View Detailed Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  {/* How Referrals Work */}
                  <Card className="bg-gray-900 border-gray-800 mb-6">
                    <CardHeader>
                      <CardTitle>How Referrals Work</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center mr-3 text-yeild-yellow">
                            1
                          </div>
                          <div>
                            <p className="font-medium">Share your referral link</p>
                            <p className="text-sm text-gray-400">Send your unique link to friends</p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center mr-3 text-yeild-yellow">
                            2
                          </div>
                          <div>
                            <p className="font-medium">Friends sign up</p>
                            <p className="text-sm text-gray-400">When they join using your link, they become your referrals</p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-8 h-8 bg-yeild-yellow/20 rounded-full flex items-center justify-center mr-3 text-yeild-yellow">
                            3
                          </div>
                          <div>
                            <p className="font-medium">Earn rewards</p>
                            <p className="text-sm text-gray-400">Get 10% of what your referrals earn</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Promotional Materials */}
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle>Promotional Materials</CardTitle>
                      <CardDescription>Resources to help you refer others</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-purple-500/20 p-2 rounded-lg mr-3 text-purple-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span>Referral Guide PDF</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-blue-500/20 p-2 rounded-lg mr-3 text-blue-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span>Social Media Images</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-green-500/20 p-2 rounded-lg mr-3 text-green-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span>Promo Video</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-yeild-yellow/20 p-2 rounded-lg mr-3 text-yeild-yellow">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </div>
                          <span>Email Templates</span>
                        </div>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
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
