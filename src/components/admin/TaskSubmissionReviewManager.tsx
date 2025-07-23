import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from 'lucide-react';

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
  tasks: {
    title: string;
    description: string;
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
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
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

      if (error) throw error;
      
      // Transform the data to match our interface with proper type conversion
      const transformedData: TaskSubmission[] = (data || []).map(submission => ({
        id: submission.id,
        task_id: submission.task_id,
        user_id: submission.user_id,
        evidence: submission.evidence,
        status: submission.status as 'pending' | 'approved' | 'rejected',
        submitted_at: submission.submitted_at,
        reviewed_at: submission.reviewed_at,
        admin_notes: submission.admin_notes,
        submission_text: submission.evidence || '', // Use evidence as submission_text
        submission_files: Array.isArray(submission.evidence_files) 
          ? submission.evidence_files.map(file => String(file))
          : [],
        reviewer_notes: submission.admin_notes,
        tasks: submission.tasks && typeof submission.tasks === 'object' && !('error' in submission.tasks)
          ? submission.tasks
          : null,
        profiles: submission.profiles && typeof submission.profiles === 'object' && !('error' in submission.profiles)
          ? submission.profiles
          : null
      }));
      
      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: string, approved: boolean, notes?: string) => {
    setProcessingId(submissionId);
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || null
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success(`Submission ${approved ? 'approved' : 'rejected'} successfully`);
      loadSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
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
                <p className="text-gray-300">{submission.tasks?.description || 'No description'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">User Submission</p>
                <p className="text-white">{submission.submission_text}</p>
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
                        className="text-yeild-yellow hover:underline block"
                      >
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
                    <p className="text-white">{new Date(submission.submitted_at).toLocaleDateString()}</p>
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
                    onClick={() => handleReview(submission.id, true)}
                    disabled={processingId === submission.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReview(submission.id, false)}
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
    </div>
  );
};
