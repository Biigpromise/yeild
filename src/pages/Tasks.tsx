
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import { TaskCard } from "@/components/TaskCard";
import { TaskSubmissionModal } from "@/components/TaskSubmissionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Filter, Grid, List } from "lucide-react";
import { taskService, Task } from "@/services/taskService";
import { toast } from "sonner";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Task filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, submissionsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getUserSubmissions()
      ]);
      setTasks(tasksData);
      setUserSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load task data");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = (task: Task) => {
    setSelectedTask(task);
    setIsSubmissionModalOpen(true);
  };

  const handleTaskSubmitted = () => {
    loadData(); // Reload data to update submission status
    toast.success("Task submitted successfully!");
  };

  const isTaskSubmitted = (taskId: string) => {
    return userSubmissions.some(sub => sub.task_id === taskId);
  };

  // Calculate task counts
  const taskCounts = {
    available: tasks.length,
    in_progress: userSubmissions.filter(s => s.status === 'pending').length,
    completed: userSubmissions.filter(s => s.status === 'approved').length,
    total: tasks.length
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
  };

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || task.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || task.difficulty === selectedDifficulty;
    
    let matchesStatus = true;
    if (selectedStatus === "available") {
      matchesStatus = !isTaskSubmitted(task.id);
    } else if (selectedStatus === "submitted") {
      matchesStatus = isTaskSubmitted(task.id);
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

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
    <>
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Browse Tasks</h1>
                <p className="text-sm text-muted-foreground">
                  Discover and complete tasks to earn points and rewards
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{taskCounts.available}</div>
                  <div className="text-xs text-muted-foreground">Available Tasks</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-blue-600">{taskCounts.in_progress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-purple-600">{taskCounts.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-xl font-bold text-orange-600">{taskCounts.total}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-6">
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

            {/* Task Categories Overview */}
            <TaskCategories onCategorySelect={handleCategorySelect} />

            {/* Filtered Tasks Results */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {selectedCategory !== "all" ? `${selectedCategory} Tasks` : "All Tasks"}
                </h3>
                <Badge variant="outline" className="text-sm">
                  {filteredTasks.length} tasks found
                </Badge>
              </div>
              
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No tasks match your current filters.</p>
                    <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                  "space-y-4"
                }>
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSubmit={handleTaskSubmit}
                      isSubmitted={isTaskSubmitted(task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Submission Modal */}
      <TaskSubmissionModal
        task={selectedTask}
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmitted={handleTaskSubmitted}
      />
    </>
  );
};

export default Tasks;
