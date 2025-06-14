import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enhancedTaskManagementService, TaskAnalytics, TaskSubmissionWithDetails } from "@/services/admin/enhancedTaskManagementService";
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
  Filter,
  BarChart2,
  Calendar,
  Tag
} from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

export const EnhancedTaskManagement = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmissionWithDetails[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tasks, submissions, and analytics in parallel
      const [tasksData, submissionsData, analyticsData] = await Promise.all([
        enhancedTaskManagementService.searchTasks({}),
        enhancedTaskManagementService.getPendingSubmissions(),
        enhancedTaskManagementService.getTaskAnalytics()
      ]);
      
      setTasks(tasksData);
      setSubmissions(submissionsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load task management data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const success = await enhancedTaskManagementService.performBulkTaskOperation({
        taskIds: [taskId],
        operation: 'delete'
      });
      
      if (success) {
        toast.success("Task deleted successfully");
        loadData();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleSubmissionUpdate = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const success = await enhancedTaskManagementService.processTaskSubmission(
        submissionId, 
        status, 
        notes
      );
      
      if (success) {
        toast.success(`Submission ${status} successfully`);
        loadData();
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  const handleDifficultyChange = (value: string) => {
    setDifficultyFilter(value);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status?.toLowerCase() === statusFilter;
    const matchesCategory = categoryFilter === "all" || task.category?.toLowerCase() === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || task.difficulty?.toLowerCase() === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDifficulty;
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
    return <LoadingState text="Loading task management data..." />;
  }

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" }
  ];

  const difficultyOptions = [
    { value: "all", label: "All Difficulties" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "social", label: "Social Media" },
    { value: "content", label: "Content Creation" },
    { value: "survey", label: "Surveys" },
    { value: "referral", label: "Referrals" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{analytics?.activeTasks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{analytics?.pendingSubmissions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{analytics?.completedTasks || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {analytics?.approvalRate ? Math.round(analytics.approvalRate) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Calendar className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <Users className="h-4 w-4 mr-2" />
            Submissions
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
              <CardDescription>Overview of task performance and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.topCategories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{category.category}</span>
                              <span className="text-sm font-medium">{category.count} tasks</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analytics.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{activity.date}</span>
                              <div className="flex gap-4">
                                <span className="text-sm">
                                  <span className="text-blue-500">{activity.submissions}</span> submissions
                                </span>
                                <span className="text-sm">
                                  <span className="text-green-500">{activity.approvals}</span> approvals
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No analytics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Management</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <SearchInput
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="md:w-1/3"
                />
                <div className="flex flex-1 gap-2">
                  <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={difficultyFilter} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.category || "Uncategorized"}</TableCell>
                          <TableCell>{task.points} pts</TableCell>
                          <TableCell>
                            <Badge className={getDifficultyColor(task.difficulty)}>
                              {task.difficulty || "Medium"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status || "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(task.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TooltipWrapper content="View task details">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipWrapper>
                              <TooltipWrapper content="Edit task">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipWrapper>
                              <TooltipWrapper content="Delete task">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipWrapper>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm || statusFilter !== "all" || categoryFilter !== "all" || difficultyFilter !== "all" 
                            ? "No tasks match your filters" 
                            : "No tasks found. Create your first task!"}
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
              <CardTitle>Task Submissions</CardTitle>
              <CardDescription>Review and approve user submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length > 0 ? (
                      submissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>{submission.profiles?.name || "Unknown User"}</TableCell>
                          <TableCell>{submission.tasks?.title || "Unknown Task"}</TableCell>
                          <TableCell>{new Date(submission.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-blue-600"
                            >
                              View Evidence
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              submission.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              submission.status === "approved" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                                onClick={() => handleSubmissionUpdate(submission.id, 'approved')}
                                disabled={submission.status !== "pending"}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                                onClick={() => handleSubmissionUpdate(submission.id, 'rejected')}
                                disabled={submission.status !== "pending"}
                              >
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No task submissions found
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Categories</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Category management coming soon
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
