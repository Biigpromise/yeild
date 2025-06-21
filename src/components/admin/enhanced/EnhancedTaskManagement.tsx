
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TaskCreationForm } from "./TaskCreationForm";
import { TaskCategoryManager } from "./TaskCategoryManager";
import { TaskEditDialog } from "./TaskEditDialog";
import { TaskTemplateManager } from "./TaskTemplateManager";
import { BulkTaskOperations } from "./BulkTaskOperations";
import { TaskScheduler } from "./TaskScheduler";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { TaskPerformanceAnalytics } from "./TaskPerformanceAnalytics";
import { TaskTable } from "../TaskTable";
import { TaskFilterBar } from "../TaskFilterBar";
import { TaskOverviewStats } from "../TaskOverviewStats";
import { getDifficultyColor, getStatusColor } from "../utils/taskColorUtils";
import ErrorBoundary from "@/components/ErrorBoundary";

export const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading enhanced task management data...');
      
      const [tasksData, submissionsData] = await Promise.all([
        enhancedTaskManagementService.getTasks(),
        enhancedTaskManagementService.getAllSubmissions()
      ]);

      console.log('Loaded tasks:', tasksData);
      console.log('Loaded submissions:', submissionsData);
      
      setTasks(tasksData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load task management data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      setDeleteLoading(taskId);
      const success = await enhancedTaskManagementService.deleteTask(taskId);
      if (success) {
        await loadData();
        toast.success("Task deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmissionUpdate = async () => {
    await loadData();
  };

  const handleEditTask = (task: any) => {
    console.log('Edit task clicked:', task);
    setEditingTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDuplicateTask = async (task: any) => {
    try {
      const duplicatedTask = {
        ...task,
        title: `${task.title} (Copy)`,
        status: 'draft'
      };
      delete duplicatedTask.id;
      delete duplicatedTask.created_at;
      
      const success = await enhancedTaskManagementService.createTask(duplicatedTask);
      if (success) {
        await loadData();
        toast.success("Task duplicated successfully");
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
      toast.error("Failed to duplicate task");
    }
  };

  const handleTemplateSelected = (template: any) => {
    setTemplateData(template);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
  const activeTasksCount = tasks.filter(task => task.status === 'active').length;
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter(sub => sub.status === 'approved').length;

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
    <div className="space-y-6">
      {/* Overview Stats */}
      <TaskOverviewStats 
        activeTasksCount={activeTasksCount}
        pendingSubmissionsCount={pendingSubmissions.length}
        totalSubmissions={totalSubmissions}
        approvalRate={totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Ops</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TaskPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskFilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
              />
              <TaskTable 
                tasks={filteredTasks}
                getDifficultyColor={getDifficultyColor}
                getStatusColor={getStatusColor}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                deleteLoading={deleteLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Submissions Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Submission review interface will be implemented here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <ErrorBoundary
            fallback={
              <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-6 text-center">
                  <div className="text-red-500 mb-4">
                    <h3 className="text-lg font-semibold">Unable to Load Create Task Form</h3>
                    <p>There was an issue loading the task creation form. Please try refreshing the page.</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <div className="w-full">
              <TaskCreationForm 
                onTaskCreated={loadData}
                onCancel={() => {
                  console.log('Task creation cancelled');
                }}
                initialData={templateData}
              />
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TaskTemplateManager onTemplateSelected={handleTemplateSelected} />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkTaskOperations tasks={tasks} onTasksUpdated={loadData} />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <TaskScheduler tasks={tasks} onTasksUpdated={loadData} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <TaskCategoryManager onCategoryUpdated={loadData} />
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      <TaskEditDialog
        task={editingTask}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTask(null);
        }}
        onTaskUpdated={loadData}
      />
    </div>
  );
};
