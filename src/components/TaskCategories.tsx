
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
  Target,
  Plus
} from "lucide-react";
import { Button } from "./ui/button";

interface TaskCategoriesProps {
  categories?: TaskCategory[];
  onCategorySelect?: (categoryId: string) => void;
}

const iconMap = {
  FileText,
  Smartphone,
  PenTool,
  Share2,
  Search
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
      
      setCategories(propCategories || categoriesData);
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
  };

  const isTaskSubmitted = (taskId: string) => {
    return userSubmissions.some(sub => sub.task_id === taskId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  return (
    <>
      <div className="space-y-8">
        {/* Category Overview */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || FileText;
              const categoryTasks = tasks.filter(task => task.category === category.name);
              
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onCategorySelect?.(category.name)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${category.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {categoryTasks.length} tasks
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {categoryTasks.length > 0 
                          ? `~${Math.round(categoryTasks.reduce((sum, t) => sum + t.points, 0) / categoryTasks.length)} pts avg`
                          : "No tasks"
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold mb-2">No categories available yet</h3>
              <p className="text-muted-foreground mb-4">
                Task categories will appear here once they're created by administrators.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Available Tasks */}
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
