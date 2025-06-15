
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskCategoryManager } from "./TaskCategoryManager";
import { TaskCreationForm } from "./TaskCreationForm";
import { enhancedTaskManagementService } from "@/services/admin/enhancedTaskManagementService";
import { TaskViewModal } from "./TaskViewModal";
import { TaskPerformanceAnalytics } from "./TaskPerformanceAnalytics";

export const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsTasksLoading(true);
    try {
      const data = await enhancedTaskManagementService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
      setTasks([]);
    } finally {
      setIsTasksLoading(false);
    }
  }, []);

  const refetchTasks = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await loadTasks();
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadTasks]);

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    loadTasks();
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await enhancedTaskManagementService.deleteTask(taskToDelete.id);
      toast.success("Task deleted successfully");
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleteConfirmationOpen(false);
      setTaskToDelete(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <TaskPerformanceAnalytics />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Task Management</CardTitle>
            <Button onClick={() => { setTaskToEdit(null); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TaskCategoryManager onCategoryUpdated={refetchTasks} />
          <div className="mt-4">
            {isTasksLoading ? (
              <p>Loading tasks...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.category_id}</TableCell>
                      <TableCell>{task.points}</TableCell>
                      <TableCell>
                        <Badge variant={task.status === 'active' ? 'outline' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEditModal(task)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTask(task)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{taskToEdit ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <TaskCreationForm
            taskToEdit={taskToEdit}
            onTaskCreated={handleTaskCreated}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <TaskViewModal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
};
