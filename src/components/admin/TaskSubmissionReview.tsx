
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Star } from "lucide-react";

interface SubmissionDetails {
  id: string;
  user_id: string;
  task_id: string;
  status: string;
  submission_text: string;
  evidence?: string;
  image_url?: string;
  evidence_file_url?: string;
  submitted_at: string;
  admin_notes?: string;
  calculated_points?: number;
  tasks: {
    title: string;
    points: number;
    category: string;
    difficulty: string;
  } | null;
  profiles: {
    name: string;
    email: string;
  } | null;
}

interface TaskSubmissionReviewProps {
  submissions: SubmissionDetails[];
  onUpdate: (submissionId: string, status: 'approved' | 'rejected', notes?: string, qualityScore?: number) => void;
  readOnly?: boolean;
}

export const TaskSubmissionReview: React.FC<TaskSubmissionReviewProps> = ({ 
  submissions, 
  onUpdate, 
  readOnly = false 
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetails | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [qualityScore, setQualityScore] = useState<number>(80);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const handleApprove = (submission: SubmissionDetails) => {
    if (readOnly) return;
    
    setSelectedSubmission(submission);
    setActionType('approve');
    setAdminNotes("");
    setQualityScore(80);
    setIsDialogOpen(true);
  };

  const handleReject = (submission: SubmissionDetails) => {
    if (readOnly) return;
    
    setSelectedSubmission(submission);
    setActionType('reject');
    setAdminNotes("");
    setIsDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedSubmission) return;
    
    onUpdate(selectedSubmission.id, actionType, adminNotes, actionType === 'approve' ? qualityScore : undefined);
    setIsDialogOpen(false);
    setSelectedSubmission(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No submissions found</div>
            <p className="text-sm text-gray-400">
              {readOnly ? 'No submissions in this category' : 'No pending submissions to review'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{submission.tasks?.title || 'Unknown Task'}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                  <Badge variant="outline" className={getDifficultyColor(submission.tasks?.difficulty || '')}>
                    {submission.tasks?.difficulty || 'Unknown'}
                  </Badge>
                  <Badge variant="outline">
                    {submission.tasks?.points || 0} points
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{submission.profiles?.name || 'Unknown User'}</div>
                <div className="text-xs text-gray-500">{submission.profiles?.email || 'No email'}</div>
                <div className="text-xs text-gray-400">
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Submission:</Label>
                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                  {submission.submission_text || submission.evidence || 'No description provided'}
                </p>
              </div>
              
              {(submission.image_url || submission.evidence_file_url) && (
                <div>
                  <Label className="text-sm font-medium">Evidence:</Label>
                  <div className="mt-1">
                    <img 
                      src={submission.image_url || submission.evidence_file_url} 
                      alt="Submission evidence" 
                      className="max-w-xs rounded border"
                    />
                  </div>
                </div>
              )}

              {submission.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes:</Label>
                  <p className="text-sm mt-1 p-2 bg-blue-50 rounded">{submission.admin_notes}</p>
                </div>
              )}

              {!readOnly && submission.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => handleApprove(submission)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleReject(submission)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {readOnly && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Only
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {actionType === 'approve' && (
              <div>
                <Label htmlFor="quality-score">Quality Score (1-100)</Label>
                <Input
                  id="quality-score"
                  type="number"
                  min="1"
                  max="100"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(parseInt(e.target.value))}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about your decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmAction}>
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
