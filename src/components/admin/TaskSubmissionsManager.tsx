
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  evidence: string;
  evidence_file_url: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  calculated_points?: number;
  task_info?: {
    title: string;
    points: number;
    brand_user_id: string;
    category: string;
  };
  user_info?: {
    name: string;
    email: string;
    profile_picture_url?: string;
  };
}

export const TaskSubmissionsManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-task-submissions', statusFilter, searchTerm],
    queryFn: async () => {
      console.log('Fetching task submissions with status:', statusFilter);
      
      let query = supabase
        .from('task_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.ilike('evidence', `%${searchTerm}%`);
      }

      const { data: submissionsData, error } = await query;
      
      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      // Get additional data for each submission
      const enrichedSubmissions = await Promise.all(
        (submissionsData || []).map(async (submission) => {
          // Get task info
          const { data: task } = await supabase
            .from('tasks')
            .select('title, points, brand_user_id, category')
            .eq('id', submission.task_id)
            .single();

          // Get user info
          const { data: user } = await supabase
            .from('profiles')
            .select('name, email, profile_picture_url')
            .eq('id', submission.user_id)
            .single();

          return {
            ...submission,
            task_info: task || undefined,
            user_info: user || undefined
          };
        })
      );

      console.log('Fetched submissions:', enrichedSubmissions);
      return enrichedSubmissions as TaskSubmission[];
    },
  });

  const { data: submissionStats } = useQuery({
    queryKey: ['submission-stats'],
    queryFn: async () => {
      const { count: totalSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true });

      const { count: pendingSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: approvedSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: rejectedSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      return {
        total: totalSubmissions || 0,
        pending: pendingSubmissions || 0,
        approved: approvedSubmissions || 0,
        rejected: rejectedSubmissions || 0,
      };
    },
  });

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) throw new Error('Submission not found');

      // Update submission status
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: reviewNotes,
          calculated_points: submission.task_info?.points || 0
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Award points to user by updating their profile points directly
      if (submission.task_info?.points) {
        // Get current user profile data
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('points, tasks_completed')
          .eq('id', submission.user_id)
          .single();

        if (!profileError && userProfile) {
          // Update user points and tasks completed
          const { error: pointsError } = await supabase
            .from('profiles')
            .update({
              points: (userProfile.points || 0) + submission.task_info.points,
              tasks_completed: (userProfile.tasks_completed || 0) + 1
            })
            .eq('id', submission.user_id);

          if (pointsError) {
            console.error('Error awarding points:', pointsError);
          }
        }
      }

      toast.success('Submission approved and user rewarded!');
      setReviewNotes('');
      setSelectedSubmission(null);
      refetch();
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission: ' + error.message);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: reviewNotes
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission rejected');
      setReviewNotes('');
      setSelectedSubmission(null);
      refetch();
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Task Submissions</h1>
        <p className="text-muted-foreground">
          Review and manage user task submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{submissionStats?.total || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">{submissionStats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{submissionStats?.approved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{submissionStats?.rejected || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions found</p>
              <p className="text-sm text-muted-foreground mt-2">
                {statusFilter !== 'all' ? `No ${statusFilter} submissions` : 'No submissions yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={submission.user_info?.profile_picture_url} />
                      <AvatarFallback>
                        {submission.user_info?.name?.charAt(0) || submission.user_info?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{submission.user_info?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{submission.task_info?.title || 'Unknown Task'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1">{submission.status}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {submission.task_info?.points || 0} points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Submission</DialogTitle>
                          <DialogDescription>
                            Task: {submission.task_info?.title || 'Unknown Task'}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Submitted by:</label>
                            <p className="text-sm">{submission.user_info?.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{submission.user_info?.email}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Evidence:</label>
                            <p className="text-sm mt-1 p-3 bg-muted rounded">{submission.evidence}</p>
                          </div>
                          
                          {submission.evidence_file_url && (
                            <div>
                              <label className="text-sm font-medium">Evidence File:</label>
                              <div className="mt-1">
                                <a 
                                  href={submission.evidence_file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                >
                                  View Evidence File
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-sm font-medium">Points:</label>
                            <p className="text-sm">{submission.task_info?.points || 0} points</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Review Notes:</label>
                            <Textarea
                              placeholder="Add your review notes..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          {submission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleApproveSubmission(submission.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                onClick={() => handleRejectSubmission(submission.id)}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {submission.status !== 'pending' && (
                            <div className="p-3 bg-muted rounded">
                              <p className="text-sm font-medium">
                                Status: {submission.status}
                              </p>
                              {submission.reviewed_at && (
                                <p className="text-xs text-muted-foreground">
                                  Reviewed: {new Date(submission.reviewed_at).toLocaleString()}
                                </p>
                              )}
                              {submission.admin_notes && (
                                <p className="text-sm mt-2">
                                  <span className="font-medium">Notes:</span> {submission.admin_notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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
