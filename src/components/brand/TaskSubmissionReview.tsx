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

export const TaskSubmissionReview = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Mock submission data
  const submissions = [
    {
      id: '1',
      taskTitle: 'Instagram Story Post',
      userName: 'Sarah Chen',
      userAvatar: '/avatars/sarah.jpg',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      content: 'Amazing summer collection! Love the colors and style. Perfect for beach season! 🌊☀️',
      mediaUrl: '/submissions/summer-post.jpg',
      socialProof: {
        likes: 245,
        comments: 18,
        shares: 12
      },
      userRating: 4.8,
      userFollowers: 12500
    },
    {
      id: '2',
      taskTitle: 'Product Review Video',
      userName: 'Mike Johnson', 
      userAvatar: '/avatars/mike.jpg',
      submittedAt: '2024-01-14T15:45:00Z',
      status: 'approved',
      content: 'Honest review of the new gadget. Really impressed with the build quality and features.',
      mediaUrl: '/submissions/gadget-review.mp4',
      socialProof: {
        likes: 1200,
        comments: 89,
        shares: 45
      },
      userRating: 4.9,
      userFollowers: 35000
    },
    {
      id: '3',
      taskTitle: 'Brand Awareness Survey',
      userName: 'Emma Davis',
      userAvatar: '/avatars/emma.jpg', 
      submittedAt: '2024-01-13T09:15:00Z',
      status: 'rejected',
      content: 'Completed the brand survey about recognition and preferences.',
      socialProof: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      userRating: 4.2,
      userFollowers: 2800,
      rejectionReason: 'Incomplete survey responses'
    }
  ];

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
    console.log('Approving submission:', submissionId);
    // TODO: Implement approval logic
  };

  const handleReject = (submissionId: string) => {
    console.log('Rejecting submission:', submissionId);
    // TODO: Implement rejection logic
  };

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
                        <AvatarImage src={submission.userAvatar} />
                        <AvatarFallback>{submission.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{submission.userName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {submission.userRating} • {submission.userFollowers.toLocaleString()} followers
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
                    <p className="text-sm text-muted-foreground">Task: {submission.taskTitle}</p>
                    <p className="mt-1">{submission.content}</p>
                  </div>

                  {submission.mediaUrl && (
                    <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Media Content</p>
                        <Button variant="link" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Submission
                        </Button>
                      </div>
                    </div>
                  )}

                  {submission.socialProof && (
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>{submission.socialProof.likes} likes</span>
                      <span>{submission.socialProof.comments} comments</span>
                      <span>{submission.socialProof.shares} shares</span>
                    </div>
                  )}

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
                        <AvatarImage src={submission.userAvatar} />
                        <AvatarFallback>{submission.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{submission.userName}</h4>
                        <p className="text-sm text-muted-foreground">{submission.taskTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        {submission.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {submission.rejectionReason && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-300">
                      Reason: {submission.rejectionReason}
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