
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskSubmissionReview } from "./TaskSubmissionReview";
import { CreateTaskForm } from "./CreateTaskForm";
import { CampaignApprovalTab } from "./CampaignApprovalTab";
import { EnhancedCampaignApprovalTab } from "./campaigns/EnhancedCampaignApprovalTab";
import { EnhancedTaskTable } from "./tasks/EnhancedTaskTable";
import { toast } from "sonner";
import { Plus, CheckCircle } from "lucide-react";
import { TaskOverviewStats } from "./TaskOverviewStats";
import { TaskFilterBar } from "./TaskFilterBar";
import { TaskTable } from "./TaskTable";
import { useAdminTaskManagement } from "./hooks/useAdminTaskManagement";
import { getStatusColor, getDifficultyColor } from "./utils/taskColorUtils";
import { TaskEditDialog } from "./enhanced/TaskEditDialog";
import { TaskCategoryManager } from "./enhanced/TaskCategoryManager";
import { AutomatedProcessingPanel } from "./AutomatedProcessingPanel";
import { BulkOperationsPanel } from "./BulkOperationsPanel";
import { RealTimePointsPanel } from "./RealTimePointsPanel";
import { TaskSourceAnalyticsDashboard } from './TaskSourceAnalyticsDashboard';

export const TaskManagement = () => {
  const {
    tasks,
    setTasks,
    submissions,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loading,
    showCreateForm,
    setShowCreateForm,
    deleteLoading,
    handleDeleteTask,
    handleSubmissionUpdate,
    filteredTasks,
    pendingSubmissions,
    activeTasksCount,
    totalSubmissions,
    approvedSubmissions,
    loadData,
  } = useAdminTaskManagement();

  const [editTaskModalOpen, setEditTaskModalOpen] = React.useState(false);
  const [taskToEdit, setTaskToEdit] = React.useState(null);

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setEditTaskModalOpen(true);
  };

  const handleTaskUpdated = () => {
    loadData();
    setEditTaskModalOpen(false);
    setTaskToEdit(null);
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
    <div className="h-screen flex flex-col gap-6 p-6 overflow-hidden">
      <TaskOverviewStats 
        activeTasksCount={activeTasksCount}
        pendingSubmissionsCount={pendingSubmissions.length}
        totalSubmissions={totalSubmissions}
        approvalRate={totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0}
      />

      <Tabs defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
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
          <TabsTrigger value="campaigns">
            <CheckCircle className="w-4 h-4 mr-2" />
            Campaign Approvals
          </TabsTrigger>
          <TabsTrigger value="automation">Auto Processing</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="analytics">Task Analytics</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Points</TabsTrigger>
          <TabsTrigger value="create">Create Task</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Management</CardTitle>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <TaskFilterBar
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
              />
              <div className="flex-1 overflow-auto">
                <EnhancedTaskTable 
                  tasks={filteredTasks}
                  loading={loading}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onView={handleEditTask}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="flex-1 overflow-hidden">
          <TaskSubmissionReview 
            submissions={submissions}
            onUpdate={handleSubmissionUpdate}
          />
        </TabsContent>

        <TabsContent value="campaigns" className="flex-1 overflow-y-auto">
          <EnhancedCampaignApprovalTab />
        </TabsContent>

        <TabsContent value="automation" className="flex-1 overflow-y-auto">
          <AutomatedProcessingPanel />
        </TabsContent>

        <TabsContent value="bulk" className="flex-1 overflow-y-auto">
          <BulkOperationsPanel />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-y-auto">
          <TaskSourceAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="realtime" className="flex-1 overflow-y-auto">
          <RealTimePointsPanel />
        </TabsContent>

        <TabsContent value="create" className="flex-1 overflow-hidden">
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <CreateTaskForm onTaskCreated={loadData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="flex-1 overflow-y-auto">
          <TaskCategoryManager onCategoryUpdated={loadData} />
        </TabsContent>
      </Tabs>

      <TaskEditDialog
        task={taskToEdit}
        isOpen={editTaskModalOpen}
        onClose={() => {
          setEditTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};
