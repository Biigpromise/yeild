import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskSubmissionReview } from "./TaskSubmissionReview";
import { CreateTaskForm } from "./CreateTaskForm";
import { taskService, Task } from "@/services/taskService";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp,
  Filter
} from "lucide-react";
import { TaskOverviewStats } from "./TaskOverviewStats";
import { TaskFilterBar } from "./TaskFilterBar";
import { TaskTable } from "./TaskTable";

export const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, submissionsData] = await Promise.all([
        taskService.admin.getAllTasks(),
        taskService.admin.getAllSubmissions()
      ]);
      
      setTasks(tasksData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await taskService.admin.deleteTask(taskId);
      toast.success("Task deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleSubmissionUpdate = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await taskService.admin.updateSubmissionStatus(submissionId, status, notes);
      toast.success(`Submission ${status} successfully`);
      loadData();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const activeTasksCount = tasks.filter(t => t.status === 'active').length;
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Overview Stats */}
      <TaskOverviewStats 
        activeTasksCount={activeTasksCount}
        pendingSubmissionsCount={pendingSubmissions.length}
        totalSubmissions={totalSubmissions}
        approvalRate={totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0}
      />

      <Tabs defaultValue="tasks" className="flex-1 flex flex-col gap-6 min-h-0">
        <TabsList>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="submissions">
            Pending Reviews
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 overflow-hidden">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Management</CardTitle>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <TaskFilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
              />
              {/* Tasks Table */}
              <TaskTable 
                tasks={filteredTasks}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
                onDeleteTask={handleDeleteTask}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 overflow-hidden">
          <TaskSubmissionReview 
            submissions={submissions}
            onUpdate={handleSubmissionUpdate}
          />
        </TabsContent>

        <TabsContent value="create" className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            <CreateTaskForm onTaskCreated={loadData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
