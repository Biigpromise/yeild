import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Eye, FileText, User } from 'lucide-react';

interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  evidence_url: string;
  evidence_text: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_feedback: string | null;
  admin_notes: string | null;
  tasks: {
    title: string;
    points: number;
  } | null;
  profiles: {
    name: string;
    email: string;
  } | null;
}

export const TaskSubmissionReviewManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!inner(title, points),
          profiles!inner(name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper null handling
      const transformedData = (data || []).map(item => ({
        id: item.id,
        task_id: item.task_id,
        user_id: item.user_id,
        evidence: item.evidence || '',
        evidence_url: item.evidence_file_url || '',
        evidence_text: item.evidence || '',
        status: item.status,
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        reviewer_feedback: item.admin_notes,
        admin_notes: item.admin_notes,
        tasks: item.tasks && typeof item.tasks === 'object' && 'title' in item.tasks 
          ? { title: item.tasks.title, points: item.tasks.points }
          : null,
        profiles: item.profiles && 
          typeof item.profiles === 'object' && 
          !Array.isArray(item.profiles) &&
          'name' in item.profiles 
          ? { 
              name: (item.profiles as any).name, 
              email: (item.profiles as any).email 
            }
          : null
      }));
      
      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load task submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewFeedback
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success(`Submission ${newStatus} successfully`);
      setReviewModalOpen(false);
      setReviewFeedback('');
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission status');
    }
  };

  const openReviewModal = (submission: TaskSubmission) => {
    setSelectedSubmission(submission);
    setReviewFeedback(submission.reviewer_feedback || '');
    setReviewModalOpen(true);
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

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedTab === 'all') return true;
    return submission.status === selectedTab;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Submission Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="font-medium">{submission.tasks?.title || 'Unknown Task'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{submission.profiles?.name || 'Unknown User'}</div>
                              <div className="text-sm text-muted-foreground">{submission.profiles?.email || 'No email'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.tasks?.points || 0}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(submission.status)} text-white`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewModal(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Task Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task</Label>
                  <p className="font-medium">{selectedSubmission.tasks?.title || 'Unknown Task'}</p>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedSubmission.profiles?.name || 'Unknown User'}</p>
                </div>
              </div>
              
              <div>
                <Label>Evidence Text</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  {selectedSubmission.evidence_text || 'No text evidence provided'}
                </div>
              </div>

              {selectedSubmission.evidence_url && (
                <div>
                  <Label>Evidence File</Label>
                  <div className="mt-1">
                    <a 
                      href={selectedSubmission.evidence_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Evidence File
                    </a>
                  </div>
                </div>
              )}

              <div>
                <Label>Reviewer Feedback</Label>
                <Textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Add your feedback here..."
                  rows={4}
                />
              </div>

              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
