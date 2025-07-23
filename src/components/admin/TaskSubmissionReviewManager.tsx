
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
  submission_text: string;
  submission_files: string[];
  reviewer_notes: string | null;
  tasks?: {
    title: string;
    description: string;
    points: number;
  } | null;
  profiles?: {
    name: string;
    email: string;
  } | null;
}

interface ReviewDialog {
  open: boolean;
  submissionId: string;
  action: 'approve' | 'reject';
  notes: string;
  userName: string;
  taskTitle: string;
}

export const TaskSubmissionReviewManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<ReviewDialog>({
    open: false,
    submissionId: '',
    action: 'approve',
    notes: '',
    userName: '',
    taskTitle: ''
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks:task_id (
            title,
            description,
            points
          ),
          profiles:user_id (
            name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform and validate the data
      const transformedData: TaskSubmission[] = (data || []).map(submission => {
        let tasks: { title: string; description: string; points: number; } | null = null;
        let profiles: { name: string; email: string; } | null = null;

        // Safe handling of tasks with comprehensive type checking
        if (submission.tasks && 
            submission.tasks !== null &&
            typeof submission.tasks === 'object' && 
            !Array.isArray(submission.tasks) &&
            !('error' in submission.tasks)) {
          const taskData = submission.tasks as any;
          if (taskData && 
              typeof taskData.title === 'string' && 
              typeof taskData.description === 'string' && 
              typeof taskData.points === 'number') {
            tasks = {
              title: taskData.title,
              description: taskData.description,
              points: taskData.points
            };
          }
        }

        // Safe handling of profiles with comprehensive type checking
        if (submission.profiles && 
            submission.profiles !== null &&
            typeof submission.profiles === 'object' && 
            !Array.isArray(submission.profiles) &&
            !('error' in submission.profiles)) {
          const profileData = submission.profiles as any;
          if (profileData && 
              typeof profileData.name === 'string' && 
              typeof profileData.email === 'string') {
            profiles = {
              name: profileData.name,
              email: profileData.email
            };
          }
        }

        return {
          id: submission.id || '',
          task_id: submission.task_id || '',
          user_id: submission.user_id || '',
          evidence: submission.evidence || '',
          status: (submission.status as 'pending' | 'approved' | 'rejected') || 'pending',
          submitted_at: submission.submitted_at || '',
          reviewed_at: submission.reviewed_at || null,
          admin_notes: submission.admin_notes || null,
          submission_text: submission.evidence || '',
          submission_files: Array.isArray(submission.evidence_files) 
            ? submission.evidence_files.map(file => String(file)).filter(Boolean)
            : [],
          reviewer_notes: submission.admin_notes || null,
          tasks: tasks,
          profiles: profiles
        };
      });
      
      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = (submissionId: string, action: 'approve' | 'reject', userName: string, taskTitle: string) => {
    setReviewDialog({
      open: true,
      submissionId,
      action,
      notes: '',
      userName,
      taskTitle
    });
  };

  const handleReview = async () => {
    const { submissionId, action, notes } = reviewDialog;
    
    setProcessingId(submissionId);
    try {
      const updateData: any = {
        status: action,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes.trim() || null
      };

      const { error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      toast.success(`Submission ${action}d successfully`);
      setReviewDialog({ open: false, submissionId: '', action: 'approve', notes: '', userName: '', taskTitle: '' });
      loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error(`Failed to ${action} submission. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Task Submissions</h2>
        <Badge variant="outline" className="text-yeild-yellow border-yeild-yellow">
          {submissions.filter(s => s.status === 'pending').length} Pending Review
        </Badge>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {submission.tasks?.title || 'Unknown Task'}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-gray-400">
                    <User className="h-4 w-4" />
                    {submission.profiles?.name || 'Unknown User'} ({submission.profiles?.email || 'No email'})
                  </div>
                </div>
                <Badge className={`${getStatusColor(submission.status)} text-white`}>
                  {getStatusIcon(submission.status)}
                  <span className="ml-1 capitalize">{submission.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Task Description</p>
                <p className="text-gray-300">{submission.tasks?.description || 'No description available'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">User Submission</p>
                <p className="text-white">{submission.submission_text || 'No submission text provided'}</p>
              </div>

              {submission.submission_files && submission.submission_files.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400">Attached Files</p>
                  <div className="space-y-2">
                    {submission.submission_files.map((file, index) => (
                      <a
                        key={index}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yeild-yellow hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View File {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Submitted</p>
                    <p className="text-white">
                      {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Points</p>
                    <p className="text-white font-semibold">{submission.tasks?.points || 0}</p>
                  </div>
                </div>
              </div>

              {submission.reviewer_notes && (
                <div>
                  <p className="text-sm text-gray-400">Reviewer Notes</p>
                  <p className="text-gray-300">{submission.reviewer_notes}</p>
                </div>
              )}

              {submission.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleReviewAction(
                      submission.id, 
                      'approve', 
                      submission.profiles?.name || 'Unknown User',
                      submission.tasks?.title || 'Unknown Task'
                    )}
                    disabled={processingId === submission.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReviewAction(
                      submission.id, 
                      'reject', 
                      submission.profiles?.name || 'Unknown User',
                      submission.tasks?.title || 'Unknown Task'
                    )}
                    disabled={processingId === submission.id}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No task submissions found</p>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Approve Submission' : 'Reject Submission'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Task: {reviewDialog.taskTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                User: {reviewDialog.userName}
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">
                {reviewDialog.action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Optional)'}
              </Label>
              <Textarea
                id="notes"
                value={reviewDialog.notes}
                onChange={(e) => setReviewDialog({ ...reviewDialog, notes: e.target.value })}
                placeholder={reviewDialog.action === 'approve' 
                  ? "Add any notes about this approval..."
                  : "Explain why this submission is being rejected..."
                }
                rows={3}
              />
            </div>

            {reviewDialog.action === 'approve' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  User will receive points and the task will be marked as completed.
                </p>
              </div>
            )}

            {reviewDialog.action === 'reject' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
                  User will not receive points and can resubmit if desired.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReviewDialog({ ...reviewDialog, open: false })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReview}
              disabled={processingId === reviewDialog.submissionId}
              className={reviewDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {processingId === reviewDialog.submissionId ? 'Processing...' : 
               reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
