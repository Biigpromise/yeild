
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TaskCreationForm } from "./TaskCreationForm";
import { TaskCategoryManager } from "./TaskCategoryManager";
import { TaskEditDialog } from "./TaskEditDialog";
import { TaskTemplateManager } from "./TaskTemplateManager";
import { BulkTaskOperations } from "./BulkTaskOperations";
import { TaskScheduler } from "./TaskScheduler";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { TaskPerformanceAnalytics } from "./TaskPerformanceAnalytics";
import { TaskFilterBar } from "../TaskFilterBar";
import { TaskOverviewStats } from "../TaskOverviewStats";
import { Plus, RefreshCw, Edit, Trash2, Copy, ExternalLink } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
      
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Get ALL tasks regardless of status to properly show them in admin
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        console.error('Error loading tasks:', tasksError);
        toast.error('Failed to load tasks');
        setTasks([]);
      } else {
        console.log('Raw tasks data from database:', tasksData);
        console.log('Tasks loaded:', tasksData?.length || 0);
        console.log('Task details:', tasksData?.map(t => ({ 
          id: t.id, 
          title: t.title, 
          status: t.status,
          created_at: t.created_at 
        })));
        setTasks(tasksData || []);
      }

      // Get submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        console.error('Error loading submissions:', submissionsError);
        toast.error('Failed to load submissions');
        setSubmissions([]);
      } else {
        console.log('Loaded submissions:', submissionsData?.length || 0);
        setSubmissions(submissionsData || []);
      }
      
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load task management data");
      setTasks([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;
    
    try {
      setDeleteLoading(taskId);
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      } else {
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
      
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase
        .from('tasks')
        .insert(duplicatedTask);

      if (error) {
        console.error("Error duplicating task:", error);
        toast.error("Failed to duplicate task");
      } else {
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

  console.log('Current task counts:', {
    totalTasks: tasks.length,
    activeTasksCount,
    pendingSubmissions: pendingSubmissions.length,
    totalSubmissions,
    approvedSubmissions
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Overview Stats */}
      <TaskOverviewStats 
        activeTasksCount={activeTasksCount}
        pendingSubmissionsCount={pendingSubmissions.length}
        totalSubmissions={totalSubmissions}
        approvalRate={totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0}
      />

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">All Tasks ({tasks.length})</TabsTrigger>
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
              <div className="flex items-center justify-between">
                <CardTitle>Task Management ({tasks.length} tasks total)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => setTemplateData(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Click the Edit or Delete buttons in the Actions column to manage individual tasks
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskFilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
              />
              
              {/* Task Management Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Task Details</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status & Info</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Points</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            {tasks.length === 0 ? "No tasks created yet. Click 'Create Task' to add your first task." : "No tasks found matching your filters"}
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">{task.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                  {task.description}
                                </div>
                                {task.category && (
                                  <div className="mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {task.category}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <Badge className={`${getStatusColor(task.status)} text-xs`}>
                                  {task.status}
                                </Badge>
                                {task.difficulty && (
                                  <Badge className={`${getDifficultyColor(task.difficulty)} text-xs`}>
                                    {task.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-lg font-bold text-blue-600">{task.points}</span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {new Date(task.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditTask(task)}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Edit Task"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDuplicateTask(task)}
                                  className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Duplicate Task"
                                >
                                  <Copy className="h-4 w-4" />
                                  <span className="hidden sm:inline">Copy</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteTask(task.id)}
                                  disabled={deleteLoading === task.id}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    {deleteLoading === task.id ? "..." : "Delete"}
                                  </span>
                                </Button>
                                {task.social_media_links && Object.values(task.social_media_links).some(link => link) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                    title="Has social media links"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
          <ErrorBoundary>
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
