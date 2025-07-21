
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCategories from "@/components/TaskCategories";
import TaskFilter from "@/components/TaskFilter";
import { TaskCard } from "@/components/TaskCard";
import { TaskSubmissionModal } from "@/components/TaskSubmissionModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target } from "lucide-react";
import { taskService, Task } from "@/services/taskService";
import { toast } from "sonner";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFiltered, setShowFiltered] = useState(false);

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
      console.log('Tasks loaded:', tasksData);
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFiltered(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedStatus("all");
    setShowFiltered(false);
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

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all" || 
                          selectedDifficulty !== "all" || selectedStatus !== "all";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
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
                  Complete tasks to earn points and rewards
                </p>
              </div>

              {tasks.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  {tasks.length} tasks available
                </Badge>
              )}
            </div>
          </div>

          {/* Show filters only if there are tasks */}
          {tasks.length > 0 && (
            <div className="mb-6">
              <TaskFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedDifficulty={selectedDifficulty}
                onDifficultyChange={setSelectedDifficulty}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                taskCounts={{
                  available: tasks.filter(t => !isTaskSubmitted(t.id)).length,
                  in_progress: userSubmissions.filter(s => s.status === 'pending').length,
                  completed: userSubmissions.filter(s => s.status === 'approved').length,
                  total: tasks.length
                }}
                onClearFilters={handleClearFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            {/* Show filtered results if filters are active */}
            {hasActiveFilters || showFiltered ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {selectedCategory !== "all" ? `${selectedCategory} Tasks` : "Filtered Tasks"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {filteredTasks.length} tasks found
                    </Badge>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
                
                {filteredTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-4">No tasks match your current filters.</p>
                      <Button variant="outline" onClick={handleClearFilters}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : (
              /* Show main task categories view */
              <TaskCategories onCategorySelect={handleCategorySelect} />
            )}
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
