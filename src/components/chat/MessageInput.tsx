
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MessageInputProps {
  onMessageSent: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: message.trim()
        });

      if (error) throw error;

      setMessage('');
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 md:p-4">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" disabled={!message.trim() || sending}>
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
