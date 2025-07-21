
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { TaskSubmissionModal } from "./TaskSubmissionModal";
import { taskService, Task, TaskCategory } from "@/services/taskService";
import { toast } from "sonner";
import { 
  FileText,
  Smartphone,
  PenTool,
  Share2,
  Search,
  Target
} from "lucide-react";

interface TaskCategoriesProps {
  categories?: TaskCategory[];
  onCategorySelect?: (categoryId: string) => void;
}

const iconMap = {
  FileText,
  Smartphone,
  PenTool,
  Share2,
  Search,
  Target
};

const TaskCategories: React.FC<TaskCategoriesProps> = ({ 
  categories: propCategories, 
  onCategorySelect 
}) => {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, tasksData, submissionsData] = await Promise.all([
        taskService.getCategories(),
        taskService.getTasks(),
        taskService.getUserSubmissions()
      ]);
      
      console.log('Categories loaded:', categoriesData);
      console.log('Tasks loaded:', tasksData);
      
      // Filter categories to only show those that have tasks
      const categoriesWithTasks = categoriesData.filter(category => {
        return tasksData.some(task => 
          task.category === category.name || 
          task.category === category.id
        );
      });
      
      setCategories(propCategories || categoriesWithTasks);
      setTasks(tasksData);
      setUserSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskSubmitted = () => {
    loadData(); // Reload data to update submission status
    toast.success("Task submitted successfully!");
  };

  const isTaskSubmitted = (taskId: string) => {
    return userSubmissions.some(sub => sub.task_id === taskId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Only show categories that have actual tasks
  const categoriesWithTasks = categories.filter(category => {
    const categoryTasks = tasks.filter(task => 
      task.category === category.name || 
      task.category === category.id
    );
    return categoryTasks.length > 0;
  });

  return (
    <>
      <div className="space-y-8">
        {/* Available Tasks - Main Focus */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Available Tasks</h3>
            <Badge variant="outline" className="text-sm">
              {tasks.length} tasks available
            </Badge>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">No tasks available</h3>
                <p className="text-muted-foreground mb-4">
                  Tasks will appear here once they're created by administrators.
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for new opportunities to earn points!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
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

        {/* Category Overview - Only if there are categories with tasks */}
        {categoriesWithTasks.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoriesWithTasks.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || FileText;
                const categoryTasks = tasks.filter(task => 
                  task.category === category.name || 
                  task.category === category.id
                );

                return (
                  <Card 
                    key={category.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onCategorySelect?.(category.name)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-gray-100 ${category.color || 'text-gray-600'}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant="outline" className="text-xs">
                        {categoryTasks.length} tasks
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <TaskSubmissionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={handleTaskSubmitted}
      />
    </>
  );
};

export default TaskCategories;
