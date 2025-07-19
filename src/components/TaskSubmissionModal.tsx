
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera, Link as LinkIcon } from 'lucide-react';
import { Task } from '@/services/taskService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [evidence, setEvidence] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!task || !user) return;

    if (!evidence.trim() && !evidenceFile) {
      toast.error('Please provide evidence of task completion');
      return;
    }

    setSubmitting(true);

    try {
      let evidenceUrl = evidence;

      // Upload file if provided
      if (evidenceFile) {
        const fileExt = evidenceFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-evidence')
          .upload(filePath, evidenceFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('task-evidence')
          .getPublicUrl(filePath);

        evidenceUrl = `${evidence}\n\nFile: ${data.publicUrl}`;
      }

      // Submit task evidence
      const { error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: task.id,
          user_id: user.id,
          evidence: evidenceUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Task submitted successfully! Your submission is under review.');
      onSubmitted();
      onClose();
      setEvidence('');
      setEvidenceFile(null);
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Task Evidence</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{task.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm font-medium text-primary">Reward: {task.points} points</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="evidence">Describe what you completed *</Label>
            <Textarea
              id="evidence"
              placeholder="Describe how you completed the task, include links, screenshots references, etc."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Upload Evidence (optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {evidenceFile ? evidenceFile.name : 'Click to upload screenshot, video, or document'}
                </p>
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || (!evidence.trim() && !evidenceFile)}
              className="flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
