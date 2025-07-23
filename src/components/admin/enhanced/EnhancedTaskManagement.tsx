import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdminTaskManagement } from '../hooks/useAdminTaskManagement';
import { enhancedTaskManagementService } from '@/services/admin/enhancedTaskManagementService';
import { Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const EnhancedTaskManagement: React.FC = () => {
  const {
    tasks,
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

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 100,
    difficulty: 'medium',
    category: 'general',
    status: 'active'
  });

  const handleCreateTask = async () => {
    try {
      const success = await enhancedTaskManagementService.createTask(newTask);
      if (success) {
        setNewTask({ title: '', description: '', points: 100, difficulty: 'medium', category: 'general', status: 'active' });
        setShowCreateForm(false);
        loadData();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
  };

  const handleUpdateSubmission = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await handleSubmissionUpdate(submissionId, status, notes);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const renderSubmissionEvidence = (submission: any) => {
    if (!submission.evidence) return null;

    let evidenceData;
    try {
      evidenceData = typeof submission.evidence === 'string' 
        ? JSON.parse(submission.evidence) 
        : submission.evidence;
    } catch (error) {
      console.error('Error parsing evidence:', error);
      return <p className="text-sm text-gray-500">Evidence format error</p>;
    }

    if (evidenceData.images && evidenceData.images.length > 0) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Photo Evidence:</Label>
          <div className="grid grid-cols-2 gap-2">
            {evidenceData.images.map((imageUrl: string, index: number) => (
              <div key={index} className="relative">
                <img 
                  src={imageUrl} 
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md border cursor-pointer hover:opacity-80"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(imageUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (evidenceData.description) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Text Evidence:</Label>
          <p className="text-sm bg-gray-50 p-3 rounded-md">{evidenceData.description}</p>
        </div>
      );
    }

    return <p className="text-sm text-gray-500">No evidence provided</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{activeTasksCount}</div>
            <p className="text-sm text-gray-600">Active Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{pendingSubmissions.length}</div>
            <p className="text-sm text-gray-600">Pending Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{totalSubmissions}</div>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{approvedSubmissions}</div>
            <p className="text-sm text-gray-600">Approved Submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tasks Management</TabsTrigger>
          <TabsTrigger value="submissions">Submissions Review</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={task.status === 'active' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {task.points} points
                        </span>
                        <span className="text-sm text-gray-500">
                          {task.difficulty || 'Medium'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deleteLoading === task.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {submission.tasks?.title || 'Task Title'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted by: {submission.profiles?.name || submission.profiles?.email || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge 
                          variant={
                            submission.status === 'pending' ? 'secondary' :
                            submission.status === 'approved' ? 'default' : 'destructive'
                          }
                        >
                          {submission.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {submission.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {submission.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                          {submission.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {submission.tasks?.points || 0} points
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Submission Details</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Task:</Label>
                                <p className="text-sm">{submission.tasks?.title}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">User:</Label>
                                <p className="text-sm">{submission.profiles?.name || submission.profiles?.email}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status:</Label>
                                <Badge className="ml-2">{submission.status}</Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Submitted:</Label>
                                <p className="text-sm">{new Date(submission.submitted_at).toLocaleString()}</p>
                              </div>
                              {renderSubmissionEvidence(submission)}
                              {submission.admin_notes && (
                                <div>
                                  <Label className="text-sm font-medium">Admin Notes:</Label>
                                  <p className="text-sm bg-gray-50 p-3 rounded-md">{submission.admin_notes}</p>
                                </div>
                              )}
                              {submission.status === 'pending' && (
                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    onClick={() => handleUpdateSubmission(submission.id, 'approved')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleUpdateSubmission(submission.id, 'rejected', 'Submission rejected by admin')}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={newTask.difficulty} onValueChange={(value) => setNewTask({ ...newTask, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} className="flex-1">
                Create Task
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
