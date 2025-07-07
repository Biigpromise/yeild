import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MessageSquare,
  Star,
  Flag,
  ExternalLink
} from 'lucide-react';
import { useBrandSubmissions } from '@/hooks/useBrandSubmissions';

export const TaskSubmissionReview = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const { submissions, loading, approveSubmission, rejectSubmission } = useBrandSubmissions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending');

  const handleApprove = (submissionId: string) => {
    approveSubmission(submissionId);
  };

  const handleReject = (submissionId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectSubmission(submissionId, reason);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Task Submissions</h2>
        <p className="text-muted-foreground">Review and approve user submissions for your tasks</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
            {pendingSubmissions.length > 0 && (
              <Badge variant="secondary">{pendingSubmissions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Previously Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-6">
            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={submission.profiles?.profile_picture_url} />
                        <AvatarFallback>{submission.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{submission.profiles?.name || 'Unknown User'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Task: {submission.tasks?.title}</p>
                    <p className="mt-1">{submission.evidence || 'No description provided'}</p>
                  </div>

                  {submission.evidence_file_url && (
                    <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Evidence File</p>
                        <Button variant="link" size="sm" asChild>
                          <a href={submission.evidence_file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Evidence
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>Points: {submission.tasks?.points || 0}</span>
                    <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={() => handleApprove(submission.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Pay
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleReject(submission.id)}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingSubmissions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No pending submissions</h3>
                  <p className="text-muted-foreground">
                    When users submit work for your tasks, they'll appear here for review.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviewed">
          <div className="grid gap-4">
            {reviewedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.profiles?.profile_picture_url} />
                        <AvatarFallback>{submission.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{submission.profiles?.name || 'Unknown User'}</h4>
                        <p className="text-sm text-muted-foreground">{submission.tasks?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                      {submission.evidence_file_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={submission.evidence_file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  {submission.admin_notes && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                      Reason: {submission.admin_notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};