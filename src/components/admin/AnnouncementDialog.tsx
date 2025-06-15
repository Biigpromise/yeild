
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminContentService } from "@/services/admin/adminContentService";
import { toast } from "@/hooks/use-toast";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnnouncementDialog: React.FC<AnnouncementDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please enter both a title and content.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await adminContentService.createAnnouncement({
        title,
        content,
        type: "info",
        target_audience: "all",
        is_active: true,
        scheduled_for: undefined,
      });
      toast({
        title: "Announcement sent!",
        description: "Announcement has been created and will be broadcast.",
      });
      setTitle("");
      setContent("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Announcement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Announcement title" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={sending}
          />
          <Textarea 
            placeholder="Announcement content" 
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={sending}
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSend} 
            disabled={sending}
            className="w-full mt-4"
          >
            {sending ? "Sending..." : "Send Announcement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
