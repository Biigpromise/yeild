import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskSubmissionModal } from "./TaskSubmissionModal";
import { TaskSocialMediaDisplay } from "./tasks/TaskSocialMediaDisplay";
import { TaskSourceBadgeEnhanced } from "./tasks/TaskSourceBadgeEnhanced";
import { taskService, Task, TaskCategory } from "@/services/taskService";
import { simplifiedTaskSubmissionService as taskSubmissionService } from "@/services/tasks/simplifiedTaskSubmissionService";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { CreateTaskForm } from "@/components/admin/CreateTaskForm";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Calendar, Star, Trophy, Target, ArrowLeft, Sparkles, TrendingUp, Clock, Users, Award, CheckCircle, Zap, Gift, Plus, Shield, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, userStats } = useDashboard();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTaskSource, setSelectedTaskSource] = useState<string>("all");
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("available");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  useEffect(() => {
    loadTasks();
    loadCategories();
    checkUserSubmissions();
    checkAdminStatus();
  }, []);
  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').single();
      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log('User is not admin');
    }
  };
  const loadTasks = async () => {
    try {
      console.log('Loading tasks...');
      const tasksData = await taskService.getTasks();
      console.log('Tasks loaded:', tasksData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  const loadCategories = async () => {
    try {
      const categoriesData = await taskService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  const checkUserSubmissions = async () => {
    try {
      const submissions = await taskService.getUserSubmissions();
      const submittedTaskIds = new Set(submissions.map(sub => sub.task_id));
      setUserSubmissions(submittedTaskIds);
    } catch (error) {
      console.error('Error checking user submissions:', error);
    }
  };
  const handleTaskClick = async (task: Task) => {
    // Navigate to task detail page instead of opening modal
    navigate(`/tasks/${task.id}`);
  };
  const handleTaskSubmitted = () => {
    checkUserSubmissions();
    loadTasks();
  };
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesTaskSource = selectedTaskSource === "all" || task.task_source === selectedTaskSource;
    const matchesTab = activeTab === "available" ? !userSubmissions.has(task.id) : userSubmissions.has(task.id);
    return matchesSearch && matchesCategory && matchesTaskSource && matchesTab;
  });
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 text-green-600 border border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20';
      case 'hard':
        return 'bg-red-500/10 text-red-600 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border border-gray-500/20';
    }
  };
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'social_media':
        return <Star className="h-4 w-4" />;
      case 'content_creation':
        return <Trophy className="h-4 w-4" />;
      case 'engagement':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative w-full mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Target className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Earn Points
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Complete tasks and earn points to level up your account
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{userStats?.points || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">{userSubmissions.size}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xl font-bold">Level {userProfile?.level || 1}</p>
                  <p className="text-xs text-muted-foreground">Current Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search tasks..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button 
                  variant={selectedCategory === "all" ? "default" : "outline"} 
                  onClick={() => setSelectedCategory("all")} 
                  size="sm" 
                  className="whitespace-nowrap bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  All Tasks
                </Button>
                <Button 
                  variant={selectedCategory === "social_media" ? "default" : "outline"} 
                  onClick={() => setSelectedCategory("social_media")} 
                  size="sm" 
                  className="whitespace-nowrap"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Social Media
                </Button>
                <Button 
                  variant={selectedCategory === "surveys" ? "default" : "outline"} 
                  onClick={() => setSelectedCategory("surveys")} 
                  size="sm" 
                  className="whitespace-nowrap"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Surveys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Create Task Section */}
        {isAdmin && <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Admin Task Management
                </CardTitle>
                <Button onClick={() => setShowCreateTask(!showCreateTask)} variant={showCreateTask ? "secondary" : "default"}>
                  {showCreateTask ? "Hide Form" : "Create New Task"}
                </Button>
              </div>
            </CardHeader>
            {showCreateTask && <CardContent>
                <CreateTaskForm onTaskCreated={() => {
            loadTasks();
            setShowCreateTask(false);
            toast.success("Task created successfully!");
          }} />
              </CardContent>}
          </Card>}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Available Tasks ({tasks.length - userSubmissions.size})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Tasks ({userSubmissions.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map(task => {
              const isSubmitted = userSubmissions.has(task.id);
              return <Card key={task.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50" onClick={() => !isSubmitted && handleTaskClick(task)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getCategoryIcon(task.category)}
                          <Badge className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          <Trophy className="h-4 w-4" />
                          <span className="font-bold text-sm">{task.points}</span>
                        </div>
                      </div>
                      
                      {/* Task Source Badge */}
                      <div className="mb-2">
                        <TaskSourceBadgeEnhanced taskSource={task.task_source || 'platform'} brandName={task.brand_name} brandLogo={task.brand_logo_url} originalBudget={task.original_budget} points={task.points} size="sm" showBudget={task.task_source === 'brand_campaign'} />
                      </div>
                      
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm line-clamp-3 text-muted-foreground">
                        {task.description}
                      </p>
                      
                      {/* Show social media links preview if available */}
                      {task.social_media_links && Object.keys(task.social_media_links).length > 0 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                          <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Social Media Tasks Required
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Visit required social media pages. Click to see details.
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Est. 10 min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Open to all</span>
                        </div>
                      </div>
                      
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Task
                      </Button>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map(task => <Card key={task.id} className="opacity-75 border-2 border-green-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getCategoryIcon(task.category)}
                        <Badge className={getDifficultyColor(task.difficulty)}>
                          {task.difficulty}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span className="font-bold text-sm">{task.points} points earned</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-500/20">
                        <Gift className="h-3 w-3 mr-1" />
                        Rewarded
                      </Badge>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>
        </Tabs>

        {filteredTasks.length === 0 && !loading && <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all" ? "Try adjusting your search or filters to find more tasks" : "Check back later for new tasks to complete"}
              </p>
              {(searchTerm || selectedCategory !== "all") && <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
          }}>
                  Clear Filters
                </Button>}
            </CardContent>
          </Card>}

        <TaskSubmissionModal task={selectedTask} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmitted={handleTaskSubmitted} />
      </div>
    </div>;
};
export default Tasks;