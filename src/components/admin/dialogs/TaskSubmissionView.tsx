import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Eye,
  ExternalLink
} from 'lucide-react';

interface TaskSubmissionViewProps {
  submission: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const TaskSubmissionView: React.FC<TaskSubmissionViewProps> = ({
  submission,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!submission) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Task Submission Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(submission.status)}>
              {getStatusIcon(submission.status)}
              <span className="ml-1 capitalize">{submission.status}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              ID: {submission.id?.substring(0, 8)}...
            </span>
          </div>

          {/* Task Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Task Information</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Title:</strong> {submission.tasks?.title || 'Unknown Task'}</p>
              <p><strong>Points:</strong> {submission.tasks?.points || 0} pts</p>
              <p><strong>Task ID:</strong> {submission.task_id}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Name:</strong> {submission.user_profile?.name || 'Unknown User'}</p>
              <p><strong>Email:</strong> {submission.user_profile?.email || 'No email'}</p>
              <p><strong>User ID:</strong> {submission.user_id}</p>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Submission Details
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
              {submission.reviewed_at && (
                <p><strong>Reviewed:</strong> {new Date(submission.reviewed_at).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Evidence/Proof Submitted
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-4">
              {submission.evidence ? (
                <>
                  {typeof submission.evidence === 'string' ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Text Evidence:</p>
                      <div className="bg-background p-3 rounded border">
                        <p className="whitespace-pre-wrap text-sm">{submission.evidence}</p>
                      </div>
                    </div>
                  ) : Array.isArray(submission.evidence) ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Evidence Files:</p>
                      <div className="space-y-2">
                        {submission.evidence.map((item, index) => (
                          <div key={index} className="bg-background p-3 rounded border">
                            {typeof item === 'string' && (item.startsWith('http') || item.includes('supabase')) ? (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">File {index + 1}:</p>
                                {item.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                  <div>
                                    <img 
                                      src={item} 
                                      alt={`Evidence ${index + 1}`}
                                      className="max-w-md max-h-64 object-contain rounded border"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        target.style.display = 'none';
                                        if (fallback) fallback.style.display = 'block';
                                      }}
                                    />
                                    <div style={{ display: 'none' }} className="p-4 bg-muted rounded text-center">
                                      <p className="text-sm text-muted-foreground">Image failed to load</p>
                                      <a href={item} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 justify-center">
                                        <ExternalLink className="h-3 w-3" />
                                        View Original
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <a 
                                    href={item} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View File
                                  </a>
                                )}
                              </div>
                            ) : (
                              <pre className="text-xs overflow-x-auto">{JSON.stringify(item, null, 2)}</pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Evidence Data:</p>
                      <div className="bg-background p-3 rounded border">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(submission.evidence, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No evidence submitted</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {submission.status === 'pending' && (
              <>
                {onReject && (
                  <Button 
                    variant="outline" 
                    onClick={() => onReject(submission.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}
                {onApprove && (
                  <Button 
                    onClick={() => onApprove(submission.id)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};