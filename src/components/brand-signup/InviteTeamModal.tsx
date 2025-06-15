
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";

interface InviteTeamModalProps {
  open: boolean;
  onClose: () => void;
}

export const InviteTeamModal: React.FC<InviteTeamModalProps> = ({ open, onClose }) => {
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (idx: number, value: string) => {
    const next = [...emails];
    next[idx] = value;
    setEmails(next);
  };

  const addEmailField = () => setEmails((prev) => [...prev, ""]);
  const removeEmailField = (idx: number) => setEmails((prev) => prev.filter((_, i) => i !== idx));
  const handleInvite = async () => {
    const filtered = emails.map(e => e.trim()).filter(Boolean);
    if (filtered.length === 0) {
      toast.error("Please enter at least one email address.");
      return;
    }
    setLoading(true);
    // Here, you could call an API/edge function to invite the team members.
    setTimeout(() => {
      toast.success(`Invitations sent to: ${filtered.join(", ")}`);
      setLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yeild-yellow" />
            Invite Your Team
          </div>
        </DialogTitle>
        <DialogDescription>
          Add teammates or admins now for faster onboarding. You can always add more later.
        </DialogDescription>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleInvite();
          }}
          className="space-y-3"
        >
          {emails.map((email, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                type="email"
                placeholder="teammate@email.com"
                value={email}
                disabled={loading}
                onChange={e => handleEmailChange(idx, e.target.value)}
                className="flex-1"
                required={idx === 0}
              />
              {emails.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeEmailField(idx)}
                  disabled={loading}
                  aria-label="Remove"
                  className="h-10"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addEmailField}
              disabled={loading}
              className="gap-1"
            >
              <UserPlus className="w-4 h-4" />
              Add Another
            </Button>
            <Button
              type="submit"
              className="yeild-btn-primary flex-1"
              loading={loading}
              disabled={loading || emails.length === 0}
            >
              {loading ? "Sending..." : "Send Invites"}
            </Button>
          </div>
        </form>
        <Button 
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs text-gray-400"
          onClick={onClose}
        >
          Skip for now
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default InviteTeamModal;
