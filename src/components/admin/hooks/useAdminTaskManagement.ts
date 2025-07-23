
import { useCallback, useEffect, useState } from "react";
import { taskService, Task } from "@/services/taskService";
import { toast } from "sonner";

export function useAdminTaskManagement() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, submissionsData] = await Promise.all([
        taskService.admin.getAllTasks(),
        taskService.admin.getAllSubmissions(),
      ]);
      setTasks(tasksData);
      setSubmissions(submissionsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setDeleteLoading(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      const success = await taskService.admin.deleteTask(taskId);
      if (success) {
        toast.success("Task deleted successfully");
        await loadData();
        setTimeout(() => {
          setTasks(currentTasks => {
            return currentTasks.filter(t => t.id !== taskId);
          });
        }, 200);
      } else {
        toast.error("Failed to delete task");
        await loadData();
      }
    } catch (error) {
      toast.error("Failed to delete task");
      await loadData();
    } finally {
      setDeleteLoading(null);
    }
  }, [loadData]);

  const handleSubmissionUpdate = useCallback(
    async (submissionId: string, status: "approved" | "rejected", notes?: string) => {
      try {
        await taskService.admin.updateSubmissionStatus(submissionId, status, notes);
        toast.success(`Submission ${status} successfully`);
        await loadData();
      } catch (error) {
        toast.error("Failed to update submission");
      }
    },
    [loadData]
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const activeTasksCount = tasks.filter((t) => t.status === "active").length;
  const totalSubmissions = submissions.length;
  const approvedSubmissions = submissions.filter((s) => s.status === "approved").length;

  return {
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
  };
}
