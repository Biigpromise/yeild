
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { taskService, Task } from "@/services/taskService";
import { taskSubmissionService } from "@/services/tasks/taskSubmissionService";
import { useTaskSubmissionPersistence } from "@/hooks/useTaskSubmissionPersistence";
import { MultipleMediaUpload } from "./posts/MultipleMediaUpload";

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
        evidence.trim() || "Files submitted", // Provide default text if empty
        undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Submit Task
            <Badge variant="outline" className="text-xs">
              {task.difficulty}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Task</Label>
            <p className="text-sm font-semibold mt-1">{task.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Reward</span>
            </div>
            <span className="text-sm font-bold text-green-600">{task.points} points</span>
          </div>

          <div>
            <Label htmlFor="evidence-files" className="text-sm font-medium">
              Upload Screenshots/Videos *
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload up to 20 screenshots or videos as evidence of task completion. Each file must be unique and cannot be reused.
            </p>
            <MultipleMediaUpload
              onFilesSelect={setEvidenceFiles}
              disabled={isSubmitting}
              maxFiles={20}
              selectedFiles={evidenceFiles}
            />
          </div>

          <div>
            <Label htmlFor="evidence" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="evidence"
              placeholder="Add any additional details about your task completion (optional)..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
              className="mt-1"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can add extra details here, but it's not required if you've uploaded files.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (!evidence.trim() && evidenceFiles.length === 0)}
            >
              {isSubmitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
