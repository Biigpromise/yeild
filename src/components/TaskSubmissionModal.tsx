
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
  const [validationError, setValidationError] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Persist form draft (evidence text + preview)
  const { clearDraft } = useTaskSubmissionPersistence(
    task ? task.id : null,
    evidence,
    setEvidence,
    evidenceFile,
    setEvidenceFile,
    filePreview,
    setFilePreview,
    isOpen // Only enable persistence when modal is open
  );

  const validateEvidence = (text: string): boolean => {
    if (!text.trim() && !evidenceFile) {
      setValidationError("Evidence is required (text or file).");
      return false;
    }
    if (text.trim() && text.trim().length < 10) {
      setValidationError("Please provide more detailed evidence (at least 10 characters)");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('TaskSubmissionModal: File selected:', file.name, file.type, file.size);
    
    // Check file type: Accept only images and videos
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only image and video files are allowed.");
      setEvidenceFile(null);
      setFilePreview(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File should be less than 15MB.");
      setEvidenceFile(null);
      setFilePreview(null);
      return;
    }
    setEvidenceFile(file);

    // Show file preview
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        setFilePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!task) {
      toast.error("No task selected");
      return;
    }

    console.log('TaskSubmissionModal: Submit button clicked');
    console.log('Evidence length:', evidence.trim().length);
    console.log('Has file:', !!evidenceFile);

    if (!validateEvidence(evidence)) {
      console.log('TaskSubmissionModal: Validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('TaskSubmissionModal: Starting submission process...');

      if (!evidence.trim() && !evidenceFile) {
        setValidationError("Please provide text or file evidence.");
        setIsSubmitting(false);
        return;
      }

      const success = await taskSubmissionService.submitTask(
        task.id,
        evidence.trim(),
        undefined,
        evidenceFile || undefined
      );

      console.log('TaskSubmissionModal: Submission result:', success);

      if (success) {
        console.log('TaskSubmissionModal: Submission successful, clearing form...');
        setEvidence("");
        setValidationError("");
        setEvidenceFile(null);
        setFilePreview(null);
        clearDraft();
        onSubmitted();
        onClose();
      } else {
        console.error('TaskSubmissionModal: Submission returned false');
        toast.error("Failed to submit task. Please check your details and try again.");
      }
    } catch (error) {
      console.error("TaskSubmissionModal: Submission error:", error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('auth')) {
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
    setValidationError("");
    setEvidenceFile(null);
    setFilePreview(null);
    clearDraft();
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Submit Task
            <Badge variant="outline" className="text-xs">
              {task.difficulty}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
            <Label htmlFor="evidence" className="text-sm font-medium">
              Evidence of Completion *
            </Label>
            <Textarea
              id="evidence"
              placeholder="Please provide proof of task completion (URL, screenshot description, detailed explanation, etc.)"
              value={evidence}
              onChange={(e) => {
                setEvidence(e.target.value);
                if (validationError) {
                  validateEvidence(e.target.value);
                }
              }}
              rows={4}
              className={`mt-1 ${validationError ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            <div className="mt-2">
              <input
                id="evidence-file"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block"
              />
              {evidenceFile && (
                <div className="mt-2 flex items-center gap-2">
                  {evidenceFile.type.startsWith("image/") && filePreview && (
                    <img src={filePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                  )}
                  {evidenceFile.type.startsWith("video/") && filePreview && (
                    <video width="80" height="60" controls className="rounded-md border">
                      <source src={filePreview} type={evidenceFile.type} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <span className="text-xs">{evidenceFile.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500"
                    onClick={() => {
                      setEvidenceFile(null);
                      setFilePreview(null);
                    }}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
            {validationError && (
              <div className="flex items-center gap-1 mt-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <p className="text-xs">{validationError}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Provide clear details or upload a screenshot/video to prove you completed this task.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || (!!validationError)}
            >
              {isSubmitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
