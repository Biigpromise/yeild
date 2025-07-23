
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TaskSubmissionModal } from "./TaskSubmissionModal";
import { taskService, Task, TaskCategory } from "@/services/taskService";
import { taskSubmissionService } from "@/services/tasks/taskSubmissionService";
import { Search, Filter, Calendar, Star, Trophy, Target, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const hasSubmitted = await taskSubmissionService.hasUserSubmittedTask(task.id);
    if (hasSubmitted) {
      toast.info("You have already submitted this task");
      return;
    }
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmitted = () => {
    checkUserSubmissions();
    loadTasks();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'social_media': return <Star className="h-4 w-4" />;
      case 'content_creation': return <Trophy className="h-4 w-4" />;
      case 'engagement': return <Target className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Back Button and Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Browse Tasks</h1>
        </div>

        {/* Stats Section - Mobile Optimized */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-lg p-4">
          <p className="text-muted-foreground mb-3">Complete tasks to earn points and rewards</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{tasks.length} Available</span>
            </div>
            <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{userSubmissions.size} Completed</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
              className="whitespace-nowrap"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                size="sm"
                className="whitespace-nowrap"
              >
                {category.name.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks Grid - Mobile Optimized */}
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isSubmitted = userSubmissions.has(task.id);
            return (
              <Card 
                key={task.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSubmitted ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50'
                }`}
                onClick={() => !isSubmitted && handleTaskClick(task)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {getCategoryIcon(task.category)}
                      <CardTitle className="text-base leading-tight">{task.title}</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <Badge className={getDifficultyColor(task.difficulty)}>
                        {task.difficulty}
                      </Badge>
                      {isSubmitted && (
                        <Badge variant="secondary" className="text-xs">
                          Submitted
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold text-primary text-sm">{task.points} points</span>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={isSubmitted}
                      className={isSubmitted ? "cursor-not-allowed" : ""}
                    >
                      {isSubmitted ? "Submitted" : "Start Task"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Check back later for new tasks"
              }
            </p>
          </div>
        )}

        <TaskSubmissionModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitted={handleTaskSubmitted}
        />
      </div>
    </div>
  );
};

export default Tasks;
