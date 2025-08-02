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
              {/* Prioritize evidence_files array if it exists and has content */}
              {submission.evidence_files && Array.isArray(submission.evidence_files) && submission.evidence_files.length > 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Uploaded Files ({submission.evidence_files.length}):</p>
                  <div className="space-y-3">
                    {submission.evidence_files.map((fileUrl, index) => (
                      <div key={index} className="bg-background p-3 rounded border">
                        <p className="text-sm font-medium mb-2">File {index + 1}:</p>
                        {fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <div>
                            <img 
                              src={fileUrl} 
                              alt={`Evidence ${index + 1}`}
                              className="max-w-full max-h-96 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                const fallback = target.nextElementSibling as HTMLElement;
                                target.style.display = 'none';
                                if (fallback) fallback.style.display = 'block';
                              }}
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer';
                                const img = document.createElement('img');
                                img.src = fileUrl;
                                img.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain';
                                modal.appendChild(img);
                                modal.onclick = () => document.body.removeChild(modal);
                                document.body.appendChild(modal);
                              }}
                            />
                            <div style={{ display: 'none' }} className="p-4 bg-muted rounded text-center">
                              <p className="text-sm text-muted-foreground">Image failed to load</p>
                              <p className="text-xs text-muted-foreground mt-2">URL: {fileUrl}</p>
                            </div>
                          </div>
                        ) : fileUrl.match(/\.(pdf)$/i) ? (
                          <div className="border rounded p-4">
                            <p className="text-sm mb-2">PDF Document:</p>
                            <iframe
                              src={fileUrl}
                              className="w-full h-96 border rounded"
                              title={`PDF Evidence ${index + 1}`}
                            />
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded text-center">
                            <p className="text-sm text-muted-foreground">File: {fileUrl.split('/').pop()}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click below to download</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = fileUrl;
                                a.download = fileUrl.split('/').pop() || 'evidence-file';
                                a.click();
                              }}
                            >
                              Download File
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Show text evidence if it exists */}
                  {submission.evidence && typeof submission.evidence === 'string' && submission.evidence.trim() !== '' && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Additional Text Evidence:</p>
                      <div className="bg-background p-3 rounded border">
                        <p className="whitespace-pre-wrap text-sm">{submission.evidence}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : submission.evidence_file_url ? (
                /* Fallback to single evidence_file_url if no evidence_files array */
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidence File:</p>
                  {submission.evidence_file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <div>
                      <img 
                        src={submission.evidence_file_url} 
                        alt="Evidence file"
                        className="max-w-full max-h-96 object-contain rounded border cursor-pointer hover:opacity-90 transition-opacity"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (fallback) fallback.style.display = 'block';
                        }}
                        onClick={() => {
                          const modal = document.createElement('div');
                          modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer';
                          const img = document.createElement('img');
                          img.src = submission.evidence_file_url;
                          img.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain';
                          modal.appendChild(img);
                          modal.onclick = () => document.body.removeChild(modal);
                          document.body.appendChild(modal);
                        }}
                      />
                      <div style={{ display: 'none' }} className="p-4 bg-muted rounded text-center">
                        <p className="text-sm text-muted-foreground">Image failed to load</p>
                        <p className="text-xs text-muted-foreground mt-2">URL: {submission.evidence_file_url}</p>
                      </div>
                    </div>
                  ) : submission.evidence_file_url.match(/\.(pdf)$/i) ? (
                    <div className="border rounded p-4">
                      <p className="text-sm mb-2">PDF Document:</p>
                      <iframe
                        src={submission.evidence_file_url}
                        className="w-full h-96 border rounded"
                        title="PDF Evidence"
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded text-center">
                      <p className="text-sm text-muted-foreground">File: {submission.evidence_file_url.split('/').pop()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click below to download</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = submission.evidence_file_url;
                          a.download = submission.evidence_file_url.split('/').pop() || 'evidence-file';
                          a.click();
                        }}
                      >
                        Download File
                      </Button>
                    </div>
                  )}
                  {/* Show text evidence if it exists */}
                  {submission.evidence && typeof submission.evidence === 'string' && submission.evidence.trim() !== '' && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Additional Text Evidence:</p>
                      <div className="bg-background p-3 rounded border">
                        <p className="whitespace-pre-wrap text-sm">{submission.evidence}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : submission.evidence && typeof submission.evidence === 'string' ? (
                /* Show only text evidence if no files */
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Text Evidence:</p>
                  <div className="bg-background p-3 rounded border">
                    <p className="whitespace-pre-wrap text-sm">{submission.evidence}</p>
                  </div>
                </div>
              ) : (
                /* No evidence found */
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