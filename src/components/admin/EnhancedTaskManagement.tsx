
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

// Define the actual database structure for task submissions - matching the database exactly
interface DatabaseTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  submission_text?: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  image_url?: string;
  calculated_points?: number;
  evidence_file_url?: string;
  evidence_files?: any;
  point_breakdown?: any;
  point_explanation?: string;
  decline_reason?: string;
  profiles?: {
    name?: string;
    email?: string;
  } | null;
  tasks?: {
    title: string;
    points: number;
  } | null;
}

export const EnhancedTaskManagement = () => {
  const [submissions, setSubmissions] = useState<DatabaseTaskSubmission[]>([]);
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

      if (error) {
        console.error('Error fetching submissions:', error);
        // Fallback query without joins if there are relationship issues
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('task_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        // Transform the data to match our interface
        const transformedData: DatabaseTaskSubmission[] = fallbackData?.map(item => ({
          ...item,
          profiles: null,
          tasks: null
        })) || [];
        
        setSubmissions(transformedData);
      } else {
        // Transform the data to match our interface, handling potential relationship errors
        const transformedData: DatabaseTaskSubmission[] = data?.map(item => {
          // Type guard to check if profiles is valid
          const hasValidProfile = item.profiles && 
            typeof item.profiles === 'object' && 
            item.profiles !== null &&
            !Array.isArray(item.profiles) &&
            'name' in item.profiles;
            
          // Type guard to check if tasks is valid  
          const hasValidTask = item.tasks &&
            typeof item.tasks === 'object' &&
            item.tasks !== null &&
            !Array.isArray(item.tasks) &&
            'title' in item.tasks;
          
          return {
            ...item,
            profiles: hasValidProfile ? (item.profiles as { name?: string; email?: string }) : null,
            tasks: hasValidTask ? (item.tasks as { title: string; points: number }) : null
          };
        }) || [];
        
        setSubmissions(transformedData);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch task submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: DatabaseTaskSubmission) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          admin_notes: feedbackText[submission.id] || null
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

  const handleDecline = async (submission: DatabaseTaskSubmission, reason: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'declined',
          decline_reason: reason,
          admin_notes: feedbackText[submission.id] || null
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
              {(submission.evidence || submission.submission_text) && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Submission Content:</h4>
                  <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg text-sm">
                    {submission.submission_text || submission.evidence}
                  </p>
                </div>
              )}

              {((submission.evidence_files && Array.isArray(submission.evidence_files) && submission.evidence_files.length > 0) || submission.evidence_file_url) && (
                <div>
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Evidence
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {submission.evidence_files && Array.isArray(submission.evidence_files) ? 
                      submission.evidence_files.map((url: string, index: number) => (
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
                      )) : submission.evidence_file_url && (
                        <div
                          className="relative group cursor-pointer bg-muted/50 rounded-lg overflow-hidden hover:bg-muted/70 transition-colors"
                          onClick={() => openImageModal(submission.evidence_file_url!)}
                        >
                          <img
                            src={submission.evidence_file_url}
                            alt="Evidence"
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      )
                    }
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

              {submission.admin_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Admin Feedback:
                  </h4>
                  <p className="text-blue-700 text-sm">{submission.admin_notes}</p>
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
