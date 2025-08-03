
import React, { useState, useRef } from 'react';
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
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async () => {
    if (!message.trim() || !user || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: message.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        
        // Provide more specific error messages
        if (error.code === '42501') {
          toast.error('You need to complete at least 1 task and have 3 active referrals to post in chat.');
        } else if (error.code === 'PGRST116') {
          toast.error('Authentication required. Please refresh and try again.');
        } else {
          toast.error('Failed to send message. Please try again.');
        }
        return;
      }

      setMessage('');
      toast.success('Message sent successfully!');
      onMessageSent();
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(uploadData.path);

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          content: `📷 ${file.name}`,
          media_url: publicUrl,
          user_id: user.id
        });

      if (messageError) {
        console.error('Error sending image message:', messageError);
        toast.error('Unable to send image. Please try again later.');
        return;
      }

      toast.success('Image shared successfully!');
      onMessageSent();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-3 md:p-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending || uploading}
            className="bg-muted border-border"
          />
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading}
          className="text-muted-foreground hover:text-foreground"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={sendMessage}
          disabled={!message.trim() || sending || uploading}
          size="sm"
          className="min-w-[60px]"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
