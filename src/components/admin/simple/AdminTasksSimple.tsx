import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { TaskSubmissionView } from '../dialogs/TaskSubmissionView';
import { toast } from 'sonner';

export const AdminTasksSimple = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-tasks-simple'],
    queryFn: async () => {
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin_secure');
      if (!isAdmin) throw new Error('Admin access required');

      const { data: submissionData, error: submissionError } = await supabase
        .from('task_submissions')
        .select(`
          id,
          user_id,
          task_id,
          status,
          submitted_at,
          evidence,
          tasks (
            id,
            title,
            points
          )
        `)
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (submissionError) throw submissionError;

      // Fetch user profiles separately
      const userIds = [...new Set(submissionData?.map(s => s.user_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      return submissionData?.map(submission => ({
        ...submission,
        user_profile: profilesData?.find(p => p.id === submission.user_id) || null
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
            <h2 className="text-2xl font-bold">Task Submissions</h2>
            <p className="text-muted-foreground">Recent task submissions for review</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
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
                        <strong>Evidence:</strong>
                        <div className="mt-1 p-2 bg-muted rounded text-xs max-h-20 overflow-y-auto">
                          {typeof submission.evidence === 'string' 
                            ? submission.evidence.length > 100 
                              ? `${submission.evidence.substring(0, 100)}...`
                              : submission.evidence
                            : 'File/Data evidence attached'
                          }
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