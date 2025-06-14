
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskCreationForm } from "./TaskCreationForm";
import { TaskCategoryManager } from "./TaskCategoryManager";
import { TaskPerformanceAnalytics } from "./TaskPerformanceAnalytics";
import { enhancedTaskManagementService, TaskFilters } from "@/services/admin/enhancedTaskManagementService";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from "lucide-react";

export const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    searchTerm: '',
    status: '',
    category: '',
    difficulty: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, submissionsData] = await Promise.all([
        enhancedTaskManagementService.searchTasks(filters),
        enhancedTaskManagementService.getPendingSubmissions()
      ]);
      
      setTasks(tasksData);
      setPendingSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setShowCreateForm(false);
    setEditingTask(null);
    loadData();
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowCreateForm(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const success = await enhancedTaskManagementService.performBulkTaskOperation({
        taskIds: [taskId],
        operation: 'delete'
      });
      
      if (success) {
        loadData();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleBulkAction = async (operation: string) => {
    if (selectedTasks.length === 0) {
      toast.error("Please select tasks first");
      return;
    }

    try {
      const success = await enhancedTaskManagementService.performBulkTaskOperation({
        taskIds: selectedTasks,
        operation: operation as any
      });
      
      if (success) {
        setSelectedTasks([]);
        loadData();
      }
    } catch (error) {
      console.error("Error with bulk action:", error);
    }
  };

  const handleSubmissionAction = async (
    submissionId: string, 
    action: 'approved' | 'rejected',
    feedback?: string
  ) => {
    try {
      await enhancedTaskManagementService.processTaskSubmission(
        submissionId, 
        action, 
        feedback
      );
      loadData();
    } catch (error) {
      console.error("Error processing submission:", error);
    }
  };

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

  if (showCreateForm) {
    return (
      <TaskCreationForm
        taskToEdit={editingTask}
        onTaskCreated={handleTaskCreated}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingTask(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">
            All Tasks
            {tasks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Pending Reviews
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Management</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')} disabled={selectedTasks.length === 0}>
                    Activate ({selectedTasks.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')} disabled={selectedTasks.length === 0}>
                    Deactivate ({selectedTasks.length})
                  </Button>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enhanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks(tasks.map(t => t.id));
                            } else {
                              setSelectedTasks([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4"
                            checked={selectedTasks.includes(task.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTasks([...selectedTasks, task.id]);
                              } else {
                                setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.category || 'General'}</Badge>
                        </TableCell>
                        <TableCell>{task.points} pts</TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty || 'Medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(task.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          {loading ? "Loading tasks..." : "No tasks found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Task Submissions Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.profiles?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{submission.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.tasks?.title}</div>
                            <div className="text-sm text-muted-foreground">{submission.tasks?.points} pts</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{submission.evidence}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 text-green-600"
                              onClick={() => handleSubmissionAction(submission.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-600"
                              onClick={() => handleSubmissionAction(submission.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pendingSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No pending submissions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <TaskCategoryManager />
        </TabsContent>

        <TabsContent value="analytics">
          <TaskPerformanceAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
