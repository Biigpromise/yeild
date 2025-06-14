
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminTaskManagementService, TaskAnalytics } from "@/services/admin/adminTaskManagementService";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Users, 
  Clock,
  TrendingUp,
  Filter,
  Download
} from "lucide-react";

export const EnhancedTaskManagement = () => {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    dateRange: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, submissionsData] = await Promise.all([
        adminTaskManagementService.getTaskAnalytics(),
        adminTaskManagementService.getPendingSubmissions()
      ]);
      
      setAnalytics(analyticsData);
      setPendingSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionAction = async (
    submissionId: string, 
    action: 'approved' | 'rejected',
    feedback?: string
  ) => {
    try {
      await adminTaskManagementService.processTaskSubmission(
        submissionId, 
        action, 
        feedback
      );
      loadData();
    } catch (error) {
      console.error("Error processing submission:", error);
    }
  };

  const handleBulkAction = async (action: 'approved' | 'rejected') => {
    if (selectedSubmissions.length === 0) {
      toast.error("Please select submissions first");
      return;
    }

    try {
      for (const submissionId of selectedSubmissions) {
        await adminTaskManagementService.processTaskSubmission(submissionId, action);
      }
      setSelectedSubmissions([]);
      loadData();
      toast.success(`Bulk ${action} completed`);
    } catch (error) {
      console.error("Error with bulk action:", error);
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
      {/* Analytics Dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{analytics.totalTasks}</p>
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
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">{analytics.activeTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold">{analytics.pendingSubmissions}</p>
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
                  <p className="text-2xl font-bold">{analytics.approvalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submissions">Pending Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk-operations">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Submissions Review</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('approved')}
                    disabled={selectedSubmissions.length === 0}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Bulk Approve ({selectedSubmissions.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkAction('rejected')}
                    disabled={selectedSubmissions.length === 0}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Bulk Reject ({selectedSubmissions.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <Input 
                  placeholder="Search submissions..." 
                  className="max-w-sm"
                />
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="survey">Surveys</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>

              {/* Submissions Table */}
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
                              setSelectedSubmissions(pendingSubmissions.map(s => s.id));
                            } else {
                              setSelectedSubmissions([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="w-4 h-4"
                            checked={selectedSubmissions.includes(submission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubmissions([...selectedSubmissions, submission.id]);
                              } else {
                                setSelectedSubmissions(selectedSubmissions.filter(id => id !== submission.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{submission.profiles?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{submission.profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{submission.tasks?.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{submission.tasks?.category}</Badge>
                        </TableCell>
                        <TableCell>{submission.tasks?.points} pts</TableCell>
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
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Task Analytics & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-operations">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Task Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Bulk operations interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
