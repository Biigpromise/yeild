import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { CheckCircle, XCircle, Clock, Eye, Plus } from 'lucide-react';
import { TaskSubmissionView } from '../dialogs/TaskSubmissionView';
import { toast } from 'sonner';

export const AdminTasksSimple = () => {
  const navigate = useNavigate();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tasks-simple'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_task_submissions', { limit_count: 20 });
      
      if (error) throw error;
      
      return data?.map(submission => ({
        id: submission.id,
        user_id: submission.user_id,
        task_id: submission.task_id,
        status: submission.status,
        evidence: submission.evidence,
        evidence_files: submission.evidence_files, // Add evidence_files
        submitted_at: submission.submitted_at,
        reviewed_at: submission.reviewed_at,
        rejection_reason: submission.rejection_reason,
        social_media_handle: submission.social_media_handle,
        evidence_file_url: submission.evidence_file_url,
        reviewer_id: submission.reviewer_id,
        tasks: {
          id: submission.task_id,
          title: submission.task_title,
          points: 100 // Default points since not in function return
        },
        user_profile: {
          id: submission.user_id,
          name: submission.user_name,
          email: submission.user_email
        }
      })) || [];
    },
    refetchInterval: 30000
  });

  const approveSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status: 'approved' })
        .eq('id', submissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Submission approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks-simple'] });
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Failed to approve submission: ' + error.message);
    }
  });

  const rejectSubmissionMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Submission rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-tasks-simple'] });
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Failed to reject submission: ' + error.message);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const handleApprove = (submissionId: string) => {
    approveSubmissionMutation.mutate(submissionId);
  };

  const handleReject = (submissionId: string) => {
    rejectSubmissionMutation.mutate(submissionId);
  };

  if (isLoading) return <LoadingState text="Loading task submissions..." />;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Task Management</h2>
            <p className="text-muted-foreground">Manage tasks and review submissions</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/admin/tasks/create')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {!submissions || submissions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No task submissions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {submission.tasks?.title || 'Unknown Task'}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1 capitalize">{submission.status}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {submission.tasks?.points || 0} points
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {submission.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(submission.id)}
                            disabled={rejectSubmissionMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(submission.id)}
                            disabled={approveSubmissionMutation.isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>User:</strong> {submission.user_profile?.name || 'Unknown User'} 
                      ({submission.user_profile?.email || 'No email'})
                    </p>
                    <p>
                      <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                     {submission.evidence && (
                       <div>
                         <strong>Evidence Preview:</strong>
                         <div className="mt-1 p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">
                           {typeof submission.evidence === 'string' ? (
                             submission.evidence.length > 100 
                               ? `${submission.evidence.substring(0, 100)}...`
                               : submission.evidence
                            ) : submission.evidence && Array.isArray(submission.evidence) ? (
                              <span className="text-primary">📎 {(submission.evidence as any[]).length} file(s) attached</span>
                            ) : (
                             <span className="text-primary">📄 Evidence data attached</span>
                           )}
                         </div>
                         <div className="mt-1">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => handleViewSubmission(submission)}
                             className="h-6 px-2 text-xs text-primary hover:text-primary-foreground"
                           >
                             View Full Evidence
                           </Button>
                         </div>
                       </div>
                     )}
                     {submission.evidence_file_url && (
                       <div>
                         <strong>Evidence File:</strong>
                         <div className="mt-1">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             onClick={() => handleViewSubmission(submission)}
                             className="h-6 px-2 text-xs text-primary hover:text-primary-foreground"
                           >
                             <Eye className="h-3 w-3 mr-1" />
                             View File in Dialog
                           </Button>
                         </div>
                       </div>
                     )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TaskSubmissionView
        submission={selectedSubmission}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedSubmission(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
};