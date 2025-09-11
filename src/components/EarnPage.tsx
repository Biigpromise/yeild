import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { taskService, Task, TaskCategory } from "@/services/taskService";
import { simplifiedTaskSubmissionService as taskSubmissionService } from "@/services/tasks/simplifiedTaskSubmissionService";
import { 
  Search, 
  Trophy, 
  Target, 
  Star, 
  ArrowLeft,
  Clock,
  ChevronRight,
  Zap,
  Gift,
  Award,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const EarnPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, userStats } = useDashboard();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTasks();
    loadCategories();
    checkUserSubmissions();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await taskService.getTasks();
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

  const handleTaskClick = (task: Task) => {
    if (!userSubmissions.has(task.id)) {
      navigate(`/tasks/${task.id}`);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    return matchesSearch && matchesCategory && !userSubmissions.has(task.id);
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'social_media':
        return <Star className="h-4 w-4" />;
      case 'surveys':
        return <Target className="h-4 w-4" />;
      case 'content_creation':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
              Earn Points
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete tasks and earn points to level up your account
            </p>
          </div>
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 animate-fade-in">
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-yellow-500/20 rounded-full">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-400">{userStats?.points || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-400">{userSubmissions.size}</p>
                  <p className="text-xs text-muted-foreground">Tasks Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Award className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-400">Level {userProfile?.level || 1}</p>
                  <p className="text-xs text-muted-foreground">Current Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative animate-fade-in" style={{animationDelay: '0.3s'}}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search tasks..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="pl-10 bg-card border-border"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <Button 
            variant={selectedCategory === "all" ? "default" : "outline"} 
            onClick={() => setSelectedCategory("all")} 
            size="sm" 
            className={`whitespace-nowrap ${selectedCategory === "all" ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
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

        {/* Available Tasks Counter */}
        <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {filteredTasks.length} Available Tasks
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            +{filteredTasks.reduce((sum, task) => sum + task.points, 0)} points
          </Badge>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <CardContent className="p-8 text-center">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No tasks available</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Check back later for new tasks!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task, index) => (
              <Card 
                key={task.id} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border hover:border-primary/50 animate-fade-in"
                style={{animationDelay: `${0.6 + (index * 0.1)}s`}}
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(task.category)}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDifficultyColor(task.difficulty)}`}
                      >
                        {task.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="h-4 w-4" />
                        <span className="font-bold">{task.points}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2 line-clamp-1">
                    {task.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>~10 min</span>
                    </div>
                    <span className="capitalize">{task.category?.replace('_', ' ')}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Spacer */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default EarnPage;