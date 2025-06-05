
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

type Task = {
  id: string;
  title: string;
  category: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Draft" | "Active" | "Paused" | "Completed";
  submissions: number;
  completions: number;
  createdAt: Date;
  expiresAt?: Date;
};

type TaskSubmission = {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  submittedAt: Date;
  status: "Pending" | "Approved" | "Rejected";
  evidence: string;
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Brand Survey",
    category: "Survey",
    points: 50,
    difficulty: "Easy",
    status: "Active",
    submissions: 145,
    completions: 132,
    createdAt: new Date(2024, 11, 1),
    expiresAt: new Date(2024, 11, 31)
  },
  {
    id: "2",
    title: "Share on Social Media",
    category: "Social",
    points: 75,
    difficulty: "Medium",
    status: "Active",
    submissions: 89,
    completions: 76,
    createdAt: new Date(2024, 11, 5),
    expiresAt: new Date(2024, 11, 25)
  },
  {
    id: "3",
    title: "Product Review Video",
    category: "Content",
    points: 200,
    difficulty: "Hard",
    status: "Paused",
    submissions: 23,
    completions: 18,
    createdAt: new Date(2024, 10, 20),
    expiresAt: new Date(2024, 11, 20)
  }
];

const mockSubmissions: TaskSubmission[] = [
  {
    id: "1",
    taskId: "1",
    taskTitle: "Complete Brand Survey",
    userId: "user1",
    userName: "John Doe",
    submittedAt: new Date(),
    status: "Pending",
    evidence: "Survey completed with ID: SURV-123456"
  },
  {
    id: "2",
    taskId: "2",
    taskTitle: "Share on Social Media",
    userId: "user2",
    userName: "Jane Smith",
    submittedAt: new Date(),
    status: "Pending",
    evidence: "https://twitter.com/janesmith/status/123456789"
  }
];

export const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingSubmissions = submissions.filter(s => s.status === "Pending");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
    switch (difficulty.toLowerCase()) {
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

  const handleApproveSubmission = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, status: "Approved" as const } : sub
      )
    );
  };

  const handleRejectSubmission = (id: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, status: "Rejected" as const } : sub
      )
    );
  };

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
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "Active").length}</p>
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
                <p className="text-2xl font-bold">{pendingSubmissions.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold">{tasks.reduce((sum, task) => sum + task.completions, 0)}</p>
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
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
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
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

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
              <div className="flex gap-4">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
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
                      <TableHead>Submissions</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>{task.points} pts</TableCell>
                        <TableCell>
                          <Badge className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.submissions}</TableCell>
                        <TableCell>
                          {task.submissions > 0 
                            ? Math.round((task.completions / task.submissions) * 100)
                            : 0}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Pending Task Submissions</CardTitle>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.userName}</TableCell>
                        <TableCell>{submission.taskTitle}</TableCell>
                        <TableCell>{submission.submittedAt.toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          <Button variant="link" className="p-0 h-auto text-blue-600">
                            View Evidence
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            submission.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            submission.status === "Approved" ? "bg-green-100 text-green-800" :
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
                              className="bg-green-50 hover:bg-green-100 text-green-600"
                              onClick={() => handleApproveSubmission(submission.id)}
                              disabled={submission.status !== "Pending"}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-600"
                              onClick={() => handleRejectSubmission(submission.id)}
                              disabled={submission.status !== "Pending"}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Performing Tasks</h4>
                  {tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex justify-between items-center p-3 bg-muted/20 rounded-md">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.completions} completions</p>
                      </div>
                      <Badge>{Math.round((task.completions / task.submissions) * 100)}%</Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Category Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Survey</span>
                      <span className="font-medium">132 completions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social</span>
                      <span className="font-medium">76 completions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content</span>
                      <span className="font-medium">18 completions</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
