
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { taskService, Task } from "@/services/taskService";

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

  const validateEvidence = (text: string): boolean => {
    if (!text.trim()) {
      setValidationError("Evidence is required");
      return false;
    }
    
    if (text.trim().length < 10) {
      setValidationError("Please provide more detailed evidence (at least 10 characters)");
      return false;
    }
    
    setValidationError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!task) {
      toast.error("No task selected");
      return;
    }

    if (!validateEvidence(evidence)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log(`Submitting task: ${task.id}`);
      const success = await taskService.submitTask(task.id, evidence.trim());
      
      if (success) {
        setEvidence("");
        setValidationError("");
        onSubmitted();
        onClose();
      }
    } catch (error) {
      console.error("Submission error in modal:", error);
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEvidence("");
    setValidationError("");
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
            />
            {validationError && (
              <div className="flex items-center gap-1 mt-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <p className="text-xs">{validationError}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Provide clear details or links that prove you completed this task. 
              Be specific and thorough to avoid delays in approval.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!evidence.trim() || isSubmitting || !!validationError}
            >
              {isSubmitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
