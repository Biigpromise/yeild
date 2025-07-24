import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X, Eye, MessageSquare, Clock, User } from 'lucide-react';

export const TaskSubmissionApprovalTab: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  // Mock data - replace with real data from API
  const submissions = [
    {
      id: '1',
      campaignName: 'Summer Sale',
      taskTitle: 'Create Instagram Post',
      userName: 'John Doe',
      userAvatar: '/placeholder-avatar.png',
      submittedAt: '2024-01-20T10:30:00Z',
      status: 'pending',
      content: {
        text: 'Amazing summer deals! Check out these incredible products...',
        images: ['/placeholder-image.jpg'],
        platform: 'Instagram'
      },
      pointsEarned: 50,
    },
    {
      id: '2',
      campaignName: 'Product Launch',
      taskTitle: 'Share on Twitter',
      userName: 'Jane Smith',
      userAvatar: '/placeholder-avatar.png',
      submittedAt: '2024-01-20T09:15:00Z',
      status: 'approved',
      content: {
        text: 'Just tried this amazing new product! Highly recommend...',
        images: [],
        platform: 'Twitter'
      },
      pointsEarned: 30,
    },
    {
      id: '3',
      campaignName: 'Winter Collection',
      taskTitle: 'Create TikTok Video',
      userName: 'Mike Johnson',
      userAvatar: '/placeholder-avatar.png',
      submittedAt: '2024-01-20T08:45:00Z',
      status: 'rejected',
      content: {
        text: 'Check out this winter collection...',
        images: ['/placeholder-image.jpg'],
        platform: 'TikTok'
      },
      pointsEarned: 0,
      rejectionReason: 'Content does not meet brand guidelines.',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = (submissionId: string) => {
    // TODO: Implement approval logic
    console.log('Approving submission:', submissionId);
  };

  const handleReject = (submissionId: string) => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    // TODO: Implement rejection logic
    console.log('Rejecting submission:', submissionId, 'Reason:', feedback);
    setFeedback('');
    setSelectedSubmission(null);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Submissions</h2>
          <p className="text-muted-foreground">
            Review and approve user submissions for your campaigns
            {pendingSubmissions.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingSubmissions.length} pending
              </Badge>
            )}
          </p>
        </div>
      </div>

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals ({pendingSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <div key={submission.id} className="p-4 border border-border rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{submission.taskTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {submission.userName} • {submission.campaignName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-1 capitalize">{submission.status}</span>
                  </Badge>
                </div>

                <div className="mb-4">
                  <h5 className="font-medium text-foreground mb-2">Submission Content:</h5>
                  <p className="text-sm text-muted-foreground mb-2">{submission.content.text}</p>
                  <Badge variant="outline">{submission.content.platform}</Badge>
                  <Badge variant="outline" className="ml-2">{submission.pointsEarned} points</Badge>
                </div>

                {selectedSubmission === submission.id ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Provide feedback for rejection (required for rejecting)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApprove(submission.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(submission.id)}
                        variant="destructive"
                        disabled={!feedback.trim()}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedSubmission(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setSelectedSubmission(submission.id)}
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviewed Submissions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recently Reviewed</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviewed submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewedSubmissions.map((submission) => (
                <div key={submission.id} className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{submission.taskTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          by {submission.userName} • {submission.campaignName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                        {submission.rejectionReason && (
                          <p className="text-xs text-destructive mt-1">
                            Reason: {submission.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};