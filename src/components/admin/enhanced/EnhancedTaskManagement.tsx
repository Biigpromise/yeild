
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
import { supabase } from '@/integrations/supabase/client';
import { ImageModal } from '../ImageModal';
import { Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock, Image as ImageIcon, ExternalLink, FileText, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

// Define the actual database structure for task submissions - matching the database exactly
interface DatabaseTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  submission_text?: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  image_url?: string;
  calculated_points?: number;
  evidence_file_url?: string;
  evidence_files?: any;
  point_breakdown?: any;
  point_explanation?: string;
  user_profile?: {
    name?: string;
    email?: string;
  } | null;
  task_details?: {
    title: string;
    points: number;
  } | null;
}

interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const EnhancedTaskManagement: React.FC = () => {
  const {
    tasks,
    setTasks,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loading,
    showCreateForm,
    setShowCreateForm,
    deleteLoading,
    handleDeleteTask,
    filteredTasks,
    activeTasksCount,
    loadData,
  } = useAdminTaskManagement();

  const [selectedSubmission, setSelectedSubmission] = useState<DatabaseTaskSubmission | null>(null);
  const [realSubmissions, setRealSubmissions] = useState<DatabaseTaskSubmission[]>([]);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Load real submission data
  React.useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const { data: submissions, error } = await supabase
          .from('task_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (error) throw error;

        // Get user and task details separately due to potential relationship issues
        const submissionsWithDetails: DatabaseTaskSubmission[] = [];
        
        for (const sub of submissions || []) {
          // Get user profile
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', sub.user_id)
            .single();

          // Get task details
          const { data: taskDetails } = await supabase
            .from('tasks')
            .select('title, points')
            .eq('id', sub.task_id)
            .single();

          submissionsWithDetails.push({
            ...sub,
            user_profile: userProfile,
            task_details: taskDetails
          });
        }
        
        setRealSubmissions(submissionsWithDetails);
        
        // Calculate stats
        const stats = {
          total: submissionsWithDetails.length,
          pending: submissionsWithDetails.filter(s => s.status === 'pending').length,
          approved: submissionsWithDetails.filter(s => s.status === 'approved').length,
          rejected: submissionsWithDetails.filter(s => s.status === 'rejected').length,
        };
        setSubmissionStats(stats);
      } catch (error) {
        console.error('Error loading submissions:', error);
      }
    };

    loadSubmissions();
  }, []);

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

  const handleViewSubmission = (submission: DatabaseTaskSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleUpdateSubmission = async (submissionId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Reload submissions data
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissions) {
        const submissionsWithDetails: DatabaseTaskSubmission[] = [];
        
        for (const sub of submissions) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', sub.user_id)
            .single();

          const { data: taskDetails } = await supabase
            .from('tasks')
            .select('title, points')
            .eq('id', sub.task_id)
            .single();

          submissionsWithDetails.push({
            ...sub,
            user_profile: userProfile,
            task_details: taskDetails
          });
        }
        
        setRealSubmissions(submissionsWithDetails);
        const stats = {
          total: submissionsWithDetails.length,
          pending: submissionsWithDetails.filter(s => s.status === 'pending').length,
          approved: submissionsWithDetails.filter(s => s.status === 'approved').length,
          rejected: submissionsWithDetails.filter(s => s.status === 'rejected').length,
        };
        setSubmissionStats(stats);
      }
      
      setSelectedSubmission(null);
      toast.success(`Submission ${status} successfully`);
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const [expandedText, setExpandedText] = useState<{ [key: string]: boolean }>({});

  const toggleTextExpansion = (submissionId: string) => {
    setExpandedText(prev => ({
      ...prev,
      [submissionId]: !prev[submissionId]
    }));
  };

  const renderSubmissionEvidence = (submission: DatabaseTaskSubmission) => {
    console.log('Rendering evidence for submission:', submission);
    
    if (!submission.evidence && !submission.evidence_files && !submission.evidence_file_url) {
      return (
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No evidence provided</span>
          </div>
        </div>
      );
    }

    let evidenceData: any = {};
    try {
      // Check for evidence_files array first (new multi-file format)
      if (submission?.evidence_files && Array.isArray(submission.evidence_files)) {
        evidenceData = { images: submission.evidence_files };
      } else if (submission?.evidence_files) {
        evidenceData = { images: [submission.evidence_files] };
      } else if (submission?.evidence_file_url) {
        evidenceData = { images: [submission.evidence_file_url] };
      } else if (submission.evidence) {
        if (typeof submission.evidence === 'string') {
          try {
            const parsed = JSON.parse(submission.evidence);
            evidenceData = parsed;
          } catch (parseError) {
            evidenceData = { description: submission.evidence };
          }
        } else {
          evidenceData = submission.evidence;
        }
      }

      // Handle submission_text as evidence
      if (submission.submission_text && !evidenceData.description) {
        evidenceData.description = submission.submission_text;
      }
    } catch (error) {
      console.error('Error parsing evidence:', error);
      return (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error loading evidence</span>
          </div>
        </div>
      );
    }

    console.log('Parsed evidence data:', evidenceData);

    const isExpanded = expandedText[submission.id];
    const truncateLength = 200;

    return (
      <div className="space-y-6">
        <Label className="text-base font-semibold text-foreground">Evidence Submitted:</Label>
        
        {/* Handle image evidence */}
        {evidenceData.images && evidenceData.images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Photo Evidence</span>
                <p className="text-xs text-muted-foreground">{evidenceData.images.length} image(s) uploaded</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {evidenceData.images.map((imageUrl: string, index: number) => (
                <div key={index} className="group relative">
                  <div className="relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background">
                    <img 
                      src={imageUrl} 
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-48 object-cover transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0E0IDQgMCAwIDAgMTcgM0g3QTQgNCAwIDAgMCAzIDdWMTdBNCA0IDAgMCAwIDcgMjFIOUwyMSA5WiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMSA5TDkgMjEiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                        target.alt = 'Failed to load image';
                        console.error('Failed to load image:', imageUrl);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="shadow-lg"
                          onClick={() => openImageModal(imageUrl)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Expand
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-lg bg-background/90"
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-muted-foreground font-medium">
                      Image {index + 1} of {evidenceData.images.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handle text evidence */}
        {evidenceData.description && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="p-2 bg-success/10 rounded-lg">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Written Evidence</span>
                <p className="text-xs text-muted-foreground">User submitted description</p>
              </div>
            </div>
            <div className="relative">
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {isExpanded || evidenceData.description.length <= truncateLength 
                    ? evidenceData.description 
                    : `${evidenceData.description.substring(0, truncateLength)}...`
                  }
                </p>
                {evidenceData.description.length > truncateLength && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTextExpansion(submission.id)}
                    className="mt-3 p-0 h-auto text-primary hover:text-primary/80"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show More ({evidenceData.description.length - truncateLength} more characters)
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for unknown format */}
        {!evidenceData.images && !evidenceData.description && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 text-warning-foreground mb-3">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Evidence format not recognized</span>
            </div>
            <div className="bg-background/50 p-3 rounded-md border">
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                {JSON.stringify(evidenceData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
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
            <div className="text-2xl font-bold text-orange-600">{submissionStats.pending}</div>
            <p className="text-sm text-gray-600">Pending Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{submissionStats.total}</div>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{submissionStats.approved}</div>
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
            {realSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {submission.task_details?.title || 'Task Title'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Submitted by: {submission.user_profile?.name || submission.user_profile?.email || 'Unknown User'}
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
                          {submission.task_details?.points || 0} points
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
                        <DialogContent className="max-w-3xl max-h-[85vh]">
                          <DialogHeader>
                            <DialogTitle>Submission Details</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-[70vh] pr-4">
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Task:</Label>
                                  <p className="text-sm mt-1">{submission.task_details?.title}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">User:</Label>
                                  <p className="text-sm mt-1">{submission.user_profile?.name || submission.user_profile?.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status:</Label>
                                  <Badge className="ml-2">{submission.status}</Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Submitted:</Label>
                                  <p className="text-sm mt-1">{new Date(submission.submitted_at).toLocaleString()}</p>
                                </div>
                              </div>
                              
                              {renderSubmissionEvidence(submission)}
                              
                              {submission.admin_notes && (
                                <div>
                                  <Label className="text-sm font-medium">Admin Notes:</Label>
                                  <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{submission.admin_notes}</p>
                                </div>
                              )}
                              
                              {submission.status === 'pending' && (
                                <div className="flex gap-2 pt-4 border-t">
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

      <ImageModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        imageUrl={selectedImage}
        title="Task Evidence"
      />
    </div>
  );
};
