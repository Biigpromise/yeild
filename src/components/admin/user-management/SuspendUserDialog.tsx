
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SuspendUserDialogProps {
  user: { id: string; name: string; email: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const SuspendUserDialog: React.FC<SuspendUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuspend = async () => {
    if (!user || !reason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setIsLoading(true);
    try {
      // Create fraud flag for suspension
      const { error } = await supabase
        .from('fraud_flags')
        .insert({
          flag_type: 'suspended_user',
          user_id: user.id,
          flag_reason: 'User suspended by admin',
          evidence: { suspension_reason: reason },
          severity: 'high'
        });

      if (error) throw error;

      toast.success(`User ${user.name} has been suspended`);
      onUpdate();
      onClose();
      setReason('');
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Suspend User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              You are about to suspend <strong>{user.name}</strong> ({user.email}).
              This action will prevent them from accessing the platform.
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Suspension *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for suspending this user..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSuspend} 
              disabled={isLoading || !reason.trim()}
              variant="destructive"
            >
              {isLoading ? 'Suspending...' : 'Suspend User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
