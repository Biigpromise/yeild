
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleSubmit = async () => {
    if (!task || !evidence.trim()) {
      toast.error("Please provide evidence for your task completion");
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.submitTask(task.id, evidence);
      toast.success("Task submitted successfully! Awaiting admin review.");
      setEvidence("");
      onSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Task: {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Task Description</Label>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Reward</Label>
            <p className="text-sm text-primary font-bold">{task.points} points</p>
          </div>
          
          <div>
            <Label htmlFor="evidence" className="text-sm font-medium">
              Evidence of Completion *
            </Label>
            <Textarea
              id="evidence"
              placeholder="Please provide proof of task completion (URL, screenshot description, etc.)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide details or links that prove you completed this task
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!evidence.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
