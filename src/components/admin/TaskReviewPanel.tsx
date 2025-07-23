
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  submission_text: string;
  image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  tasks: {
    title: string;
    points: number;
    difficulty: string;
    category: string;
  };
  profiles: {
    name: string;
    email: string;
  };
}

export const TaskReviewPanel: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [qualityScore, setQualityScore] = useState<number>(80);
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks (
            title,
            points,
            difficulty,
            category
          ),
          profiles (
            name,
            email
          )
        `)
        .eq('status', filterStatus)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes || 'Approved'
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Task submission approved successfully!');
      setSelectedSubmission(null);
      setReviewNotes('');
      loadSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes || 'Rejected'
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Task submission rejected');
      setSelectedSubmission(null);
      setReviewNotes('');
      loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const pendingSubmissions = submissions.filter(s => s.status === 'pending');
      
      for (const submission of pendingSubmissions) {
        await handleApproveSubmission(submission.id);
      }
      
      toast.success(`Approved ${pendingSubmissions.length} submissions`);
    } catch (error) {
      console.error('Error in bulk approval:', error);
      toast.error('Failed to bulk approve submissions');
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Review Panel</h2>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {filterStatus === 'pending' && (
            <Button onClick={handleBulkApprove} variant="outline">
              Bulk Approve All
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading submissions...</div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.tasks.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      By {submission.profiles.name} ({submission.profiles.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </Badge>
                    <Badge variant="outline">{submission.tasks.points} pts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Submission:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{submission.submission_text}</p>
                  </div>
                  
                  {submission.image_url && (
                    <div>
                      <p className="font-medium">Attachment:</p>
                      <img 
                        src={submission.image_url} 
                        alt="Submission evidence" 
                        className="max-w-xs rounded border"
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedSubmission(submission)}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    {submission.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveSubmission(submission.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Quick Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectSubmission(submission.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Review Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this submission..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleApproveSubmission(selectedSubmission.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => handleRejectSubmission(selectedSubmission.id)}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setSelectedSubmission(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
