
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDeclinedTaskEdit } from "@/hooks/useDeclinedTaskEdit";

interface TaskResubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  submission: any;
  onResubmitSuccess: () => void;
}

export const TaskResubmissionModal: React.FC<TaskResubmissionModalProps> = ({
  isOpen,
  onClose,
  task,
  submission,
  onResubmitSuccess
}) => {
  const [evidence, setEvidence] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  
  const { isEditing, resubmitTask, getDeclineReason } = useDeclinedTaskEdit();

  useEffect(() => {
    if (submission && isOpen) {
      setEvidence(submission.evidence || "");
      setFiles(submission.file_urls || []);
      
      // Load decline reason
      getDeclineReason(submission.id).then(reason => {
        setDeclineReason(reason);
      });
    }
  }, [submission, isOpen, getDeclineReason]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // File upload logic would go here
      // For now, we'll simulate it
      const fileName = `task-evidence/${Date.now()}-${file.name}`;
      setFiles(prev => [...prev, fileName]);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleResubmit = async () => {
    if (!evidence.trim()) {
      toast.error("Please provide evidence of task completion");
      return;
    }

    const result = await resubmitTask(submission.id, evidence, files);
    
    if (result.success) {
      toast.success("Task resubmitted successfully!");
      onResubmitSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setEvidence("");
    setFiles([]);
    setDeclineReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit & Resubmit Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{task?.title}</h3>
            <p className="text-gray-600 text-sm">{task?.description}</p>
          </div>

          {/* Decline Reason */}
          {declineReason && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Why was this declined?</h4>
                  <p className="text-red-700 text-sm mt-1">{declineReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Section */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Task Completion Evidence *</Label>
            <Textarea
              id="evidence"
              placeholder="Describe how you completed this task. Include links, screenshots, or detailed explanations..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label>Supporting Files (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx"
              />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click to upload files"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, PDF, DOC up to 10MB
                </span>
              </Label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="text-sm truncate">{file.split('/').pop()}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleResubmit}
              disabled={isEditing || !evidence.trim()}
              className="flex-1"
            >
              {isEditing ? "Resubmitting..." : "Resubmit Task"}
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
