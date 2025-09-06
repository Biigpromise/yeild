import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Upload, FileText, Camera, Video } from "lucide-react";
import { toast } from "sonner";
import { taskService, Task } from "@/services/taskService";
import { simplifiedTaskSubmissionService as taskSubmissionService } from "@/services/tasks/simplifiedTaskSubmissionService";
import { useTaskSubmissionPersistence } from "@/hooks/useTaskSubmissionPersistence";
import { MultipleMediaUpload } from "./posts/MultipleMediaUpload";
import { TaskSocialMediaDisplay } from "./tasks/TaskSocialMediaDisplay";

interface TaskSubmissionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const [evidence, setEvidence] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Clear form data when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setEvidence("");
      setEvidenceFiles([]);
    }
  }, [isOpen]);

  const validateSubmission = (): boolean => {
    if (!evidence.trim() && evidenceFiles.length === 0) {
      toast.error("Please provide either text evidence or upload files.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!task) {
      toast.error("No task selected");
      return;
    }

    console.log('TaskSubmissionModal: Submit button clicked');
    console.log('Evidence length:', evidence.trim().length);
    console.log('Files count:', evidenceFiles.length);

    if (!validateSubmission()) {
      console.log('TaskSubmissionModal: Validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('TaskSubmissionModal: Starting submission process...');

      const success = await taskSubmissionService.submitTask(
        task.id,
        evidence.trim() || "Files submitted",
        evidenceFiles // Pass all files
      );

      console.log('TaskSubmissionModal: Submission result:', success);

      if (success) {
        console.log('TaskSubmissionModal: Submission successful, clearing form...');
        setEvidence("");
        setEvidenceFiles([]);
        onSubmitted();
        onClose();
      } else {
        console.error('TaskSubmissionModal: Submission returned false');
        toast.error("Failed to submit task. Please check your details and try again.");
      }
    } catch (error) {
      console.error("TaskSubmissionModal: Submission error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already used')) {
          toast.error("One or more images have already been used. Please upload different screenshots.");
        } else if (error.message.includes('auth')) {
          toast.error("Authentication error. Please log in and try again.");
        } else if (error.message.includes('permission')) {
          toast.error("Permission denied. Please check your account status.");
        } else if (error.message.includes('already submitted')) {
          toast.error("You have already submitted this task.");
        } else {
          toast.error(`Submission failed: ${error.message}`);
        }
      } else {
        toast.error("Failed to submit task. Please try again or contact support.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log('TaskSubmissionModal: Closing modal');
    setEvidence("");
    setEvidenceFiles([]);
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Submit Task
            <Badge variant="outline" className="text-xs">
              {task.difficulty}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Overview */}
          <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Task Title</Label>
                  <h3 className="text-lg font-semibold mt-1">{task.title}</h3>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mt-2">
                    <p className="text-sm text-warning-foreground">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Reward</span>
                  </div>
                  <Badge className="bg-green-600 text-white font-bold">
                    {task.points} points
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <TaskSocialMediaDisplay 
            socialLinks={task.social_media_links} 
            taskTitle={task.title}
          />

          {/* Submission Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <Label className="text-base font-medium">
                      Upload Evidence *
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload screenshots, videos, or other files as proof of task completion. Each file must be unique.
                  </p>
                  
                  <MultipleMediaUpload
                    onFilesSelect={setEvidenceFiles}
                    disabled={isSubmitting}
                    maxFiles={20}
                    selectedFiles={evidenceFiles}
                  />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Camera className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium">Screenshots</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Video className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                      <p className="text-xs text-purple-600 font-medium">Videos</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <FileText className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <p className="text-xs text-green-600 font-medium">Documents</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Label htmlFor="evidence" className="text-base font-medium">
                      Additional Notes
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Provide any additional context or details about your task completion (optional).
                  </p>
                  
                  <Textarea
                    id="evidence"
                    placeholder="Describe how you completed the task, any challenges you faced, or additional context..."
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    rows={8}
                    className="resize-none"
                    disabled={isSubmitting}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Optional but recommended</span>
                    <span>{evidence.length}/500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guidelines */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Submission Guidelines</h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Ensure all uploaded files are clear and relevant to the task</li>
                    <li>• Do not reuse files from previous submissions</li>
                    <li>• Your submission will be reviewed before points are awarded</li>
                    <li>• Fake or incomplete submissions may result in account penalties</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (!evidence.trim() && evidenceFiles.length === 0)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};