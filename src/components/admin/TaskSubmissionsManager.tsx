import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, Download, User, Calendar, FileText } from 'lucide-react';

interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  evidence_url: string;
  evidence_text: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  points_awarded?: number;
  tasks: {
    id: string;
    title: string;
    points: number;
    description: string;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
  };
}

export const TaskSubmissionsManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
          tasks (
            id,
            title,
            points,
            description
          ),
          profiles (
            id,
            name,
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedSubmissions: TaskSubmission[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        task_id: item.task_id,
        evidence_url: item.evidence_file_url || '',
        evidence_text: item.evidence || '',
        status: item.status as 'pending' | 'approved' | 'rejected',
        submitted_at: item.submitted_at,
        reviewed_at: item.reviewed_at,
        admin_notes: item.admin_notes,
        points_awarded: item.calculated_points,
        tasks: item.tasks,
        profiles: item.profiles
      }));

      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error('Error loading task submissions:', error);
      toast.error('Failed to load task submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (submissionId: string, approved: boolean, adminNotes?: string) => {
    setProcessingId(submissionId);
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ 
          status: approved ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || ''
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
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

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
        <h2 className="text-2xl font-bold">Task Submissions</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {pendingSubmissions.length} Pending
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {approvedSubmissions.length} Approved
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-600">
            {rejectedSubmissions.length} Rejected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingSubmissions.map((submission) => (
              <Card key={submission.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{submission.tasks?.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {submission.profiles?.name || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {submission.tasks?.points} points
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1 capitalize">{submission.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Task Description:</p>
                    <p className="text-sm text-gray-600">{submission.tasks?.description}</p>
                  </div>
                  
                  {submission.evidence_text && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Evidence Text:</p>
                      <p className="text-sm text-gray-600">{submission.evidence_text}</p>
                    </div>
                  )}
                  
                  {submission.evidence_url && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Evidence File:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(submission.evidence_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Evidence
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = submission.evidence_url;
                            link.download = `evidence_${submission.id}`;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleApproval(submission.id, true)}
                      disabled={processingId === submission.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(submission.id, false)}
                      disabled={processingId === submission.id}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingSubmissions.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No pending submissions</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {approvedSubmissions.map((submission) => (
              <Card key={submission.id} className="border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{submission.tasks?.title}</h3>
                      <p className="text-sm text-gray-600">{submission.profiles?.name}</p>
                      <p className="text-xs text-gray-500">
                        Approved on {new Date(submission.reviewed_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1">Approved</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {approvedSubmissions.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No approved submissions</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {rejectedSubmissions.map((submission) => (
              <Card key={submission.id} className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{submission.tasks?.title}</h3>
                      <p className="text-sm text-gray-600">{submission.profiles?.name}</p>
                      <p className="text-xs text-gray-500">
                        Rejected on {new Date(submission.reviewed_at || '').toLocaleDateString()}
                      </p>
                      {submission.admin_notes && (
                        <p className="text-xs text-red-600 mt-1">
                          Note: {submission.admin_notes}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {getStatusIcon(submission.status)}
                      <span className="ml-1">Rejected</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {rejectedSubmissions.length === 0 && (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No rejected submissions</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
