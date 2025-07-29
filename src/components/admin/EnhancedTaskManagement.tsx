import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, User, CheckCircle, XCircle, Clock, Eye, MessageSquare, Image } from 'lucide-react';
import { format } from 'date-fns';
import { ImageModal } from './ImageModal';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  content: string;
  evidence_urls: string[];
  status: 'pending' | 'approved' | 'declined';
  submitted_at: string;
  admin_feedback?: string;
  decline_reason?: string;
  profiles?: {
    name: string;
    email: string;
  };
  tasks?: {
    title: string;
    points: number;
  };
}

export const EnhancedTaskManagement = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          profiles (name, email),
          tasks (title, points)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch task submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: TaskSubmission) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          admin_feedback: feedbackText[submission.id] || null
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Task submission approved successfully!');
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    }
  };

  const handleDecline = async (submission: TaskSubmission, reason: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'declined',
          decline_reason: reason,
          admin_feedback: feedbackText[submission.id] || null
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Task submission declined');
      fetchSubmissions();
    } catch (error) {
      console.error('Error declining submission:', error);
      toast.error('Failed to decline submission');
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      declined: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Task Submissions Management</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {submissions.filter(s => s.status === 'pending').length} Pending Reviews
        </Badge>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {submission.tasks?.title || 'Unknown Task'}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {submission.profiles?.name || 'Unknown User'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {submission.tasks?.points || 0} points
                    </div>
                  </div>
                </div>
                {getStatusBadge(submission.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {submission.content && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Submission Content:</h4>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg text-sm">
                    {submission.content}
                  </p>
                </div>
              )}

              {submission.evidence_urls && submission.evidence_urls.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Evidence ({submission.evidence_urls.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {submission.evidence_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer bg-muted/50 rounded-lg overflow-hidden hover:bg-muted/70 transition-colors"
                        onClick={() => openImageModal(url)}
                      >
                        <img
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submission.status === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Admin Feedback (Optional)
                    </label>
                    <Textarea
                      placeholder="Add feedback for the user..."
                      value={feedbackText[submission.id] || ''}
                      onChange={(e) => setFeedbackText(prev => ({
                        ...prev,
                        [submission.id]: e.target.value
                      }))}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(submission)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Submission</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Reason for declining (required)..."
                            className="min-h-[100px]"
                            id="decline-reason"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => {
                                const reason = (document.getElementById('decline-reason') as HTMLTextAreaElement)?.value;
                                if (reason.trim()) {
                                  handleDecline(submission, reason);
                                } else {
                                  toast.error('Please provide a reason for declining');
                                }
                              }}
                            >
                              Decline Submission
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}

              {(submission.status === 'declined' && submission.decline_reason) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-medium text-red-800 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Decline Reason:
                  </h4>
                  <p className="text-red-700 text-sm">{submission.decline_reason}</p>
                </div>
              )}

              {submission.admin_feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Admin Feedback:
                  </h4>
                  <p className="text-blue-700 text-sm">{submission.admin_feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {submissions.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Task Submissions</p>
                <p>There are currently no task submissions to review.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ImageModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        imageUrl={selectedImage}
        title="Task Evidence"
      />
    </div>
  );
};
