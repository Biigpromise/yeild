
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState } from "@/components/ui/loading-state";
import { taskService } from "@/services/taskService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Star, Search, Filter, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: string;
  category: string;
  estimated_time: string;
  brand_name: string;
  brand_logo_url?: string;
  status: string;
  created_at: string;
}

interface TaskSubmission {
  id: string;
  task_id: string;
  status: string;
  submitted_at: string;
  evidence: string;
}

export const TasksTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const queryClient = useQueryClient();

  // Fetch available tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'available'],
    queryFn: taskService.getTasks,
  });

  // Fetch user submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions', 'user'],
    queryFn: taskService.getUserSubmissions,
  });

  // Fetch task categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: taskService.getCategories,
  });

  // Submit task mutation
  const submitTaskMutation = useMutation({
    mutationFn: ({ taskId, evidence }: { taskId: string; evidence: string }) =>
      taskService.submitTask(taskId, evidence),
    onSuccess: () => {
      toast.success("Task submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit task");
    },
  });

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || task.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get submitted task IDs for filtering
  const submittedTaskIds = new Set(submissions.map(s => s.task_id));
  const availableTasks = filteredTasks.filter(task => !submittedTaskIds.has(task.id));
  const submittedTasks = filteredTasks.filter(task => submittedTaskIds.has(task.id));

  const handleTaskSubmit = async (taskId: string) => {
    const evidence = prompt("Please provide evidence or link for task completion:");
    if (evidence) {
      submitTaskMutation.mutate({ taskId, evidence });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSubmissionStatus = (taskId: string) => {
    return submissions.find(s => s.task_id === taskId);
  };

  if (tasksLoading || submissionsLoading) {
    return <LoadingState text="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available Tasks ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            My Submissions ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTasks.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Available</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new tasks.</p>
              </div>
            ) : (
              availableTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{task.title}</CardTitle>
                        <CardDescription className="text-sm">
                          by {task.brand_name}
                        </CardDescription>
                      </div>
                      {task.brand_logo_url && (
                        <img 
                          src={task.brand_logo_url} 
                          alt={task.brand_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {task.points} pts
                      </Badge>
                      <Badge 
                        className={`${getDifficultyColor(task.difficulty)} text-white`}
                      >
                        {task.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {task.category}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_time}
                      </Badge>
                    </div>

                    <Button 
                      onClick={() => handleTaskSubmit(task.id)}
                      className="w-full"
                      disabled={submitTaskMutation.isPending}
                    >
                      {submitTaskMutation.isPending ? "Submitting..." : "Start Task"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {submissions.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                <p className="text-gray-500">Start completing tasks to see your submissions here.</p>
              </div>
            ) : (
              submissions.map((submission) => {
                const task = tasks.find(t => t.id === submission.task_id);
                if (!task) return null;

                return (
                  <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{task.title}</CardTitle>
                          <CardDescription className="text-sm">
                            Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant={
                            submission.status === 'approved' ? 'default' :
                            submission.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {task.points} pts
                        </Badge>
                      </div>

                      {submission.evidence && (
                        <div className="text-sm">
                          <strong>Evidence:</strong>
                          <p className="text-gray-600 mt-1 line-clamp-2">
                            {submission.evidence}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
