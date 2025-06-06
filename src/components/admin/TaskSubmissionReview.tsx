
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, ExternalLink } from "lucide-react";

interface TaskSubmissionReviewProps {
  submissions: any[];
  onUpdate: (submissionId: string, status: 'approved' | 'rejected', notes?: string) => void;
}

export const TaskSubmissionReview: React.FC<TaskSubmissionReviewProps> = ({
  submissions,
  onUpdate
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || "");
    setIsModalOpen(true);
  };

  const handleAction = (type: 'approved' | 'rejected') => {
    setActionType(type);
  };

  const confirmAction = () => {
    if (selectedSubmission && actionType) {
      onUpdate(selectedSubmission.id, actionType, adminNotes);
      setIsModalOpen(false);
      setSelectedSubmission(null);
      setActionType(null);
      setAdminNotes("");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Task Submissions Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {submission.profiles?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {submission.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.tasks?.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {submission.tasks?.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {submission.tasks?.points} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setActionType('approved');
                                confirmAction();
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setActionType('rejected');
                                confirmAction();
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No task submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Task Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm">{selectedSubmission.profiles?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Task</label>
                  <p className="text-sm">{selectedSubmission.tasks?.title}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Task Description</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSubmission.tasks?.description}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Evidence Provided</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{selectedSubmission.evidence}</p>
                  {selectedSubmission.evidence?.startsWith('http') && (
                    <a 
                      href={selectedSubmission.evidence} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Link
                    </a>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this submission..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              {selectedSubmission.status === 'pending' && (
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    onClick={() => handleAction('rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction('approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Award Points
                  </Button>
                </div>
              )}
              
              {actionType && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium mb-2">
                    Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {actionType === 'approved' 
                      ? `This will award ${selectedSubmission.tasks?.points} points to the user.`
                      : 'This will reject the submission without awarding points.'
                    }
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActionType(null)}>
                      Cancel
                    </Button>
                    <Button onClick={confirmAction}>
                      Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
