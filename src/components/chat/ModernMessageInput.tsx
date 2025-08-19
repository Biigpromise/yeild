import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image, Smile, Paperclip, Mic, X, Reply } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPresence } from '@/hooks/useUserPresence';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  media_url?: string;
  message_type?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

interface ModernMessageInputProps {
  onMessageSent: () => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({ 
  onMessageSent,
  replyingTo,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const { broadcastTyping } = useUserPresence('community_chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of 120px (about 4 lines)
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
    
    // Broadcast typing status
    if (e.target.value.trim()) {
      broadcastTyping(true);
    } else {
      broadcastTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || sending) return;

    setSending(true);
    broadcastTyping(false);

    try {
      const messageData: any = {
        content: message.trim(),
        user_id: user.id,
        chat_id: null,
        message_context: 'community',
        message_type: 'text'
      };

      // Add parent message ID if replying
      if (replyingTo) {
        messageData.parent_message_id = replyingTo.id;
      }

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
        if (error.code === '42501') {
          toast.error('You need to complete at least 1 task and have 3 active referrals to post in chat.');
        } else {
          toast.error('Failed to send message. Please try again.');
        }
        return;
      }

      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      if (replyingTo) {
        toast.success('Reply sent!');
      }
      
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
          user_id: user.id,
          chat_id: null,
          message_context: 'community',
          message_type: 'image'
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const canSend = message.trim() && !sending && !uploading;

  return (
    <div className="p-4">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              <span>Replying to {replyingTo.profiles?.name || 'Anonymous'}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelReply}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-foreground/80 line-clamp-2">
            {replyingTo.content || '📷 Image'}
          </p>
        </div>
      )}
      
      <div className={cn(
        "flex items-end gap-3 p-3 rounded-2xl border transition-all duration-200",
        isFocused 
          ? "bg-card border-primary/20 shadow-sm" 
          : "bg-muted/30 border-transparent hover:bg-muted/50"
      )}>
        {/* User Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.user_metadata?.name || 'You'} 
          />
          <AvatarFallback className="text-xs font-medium bg-primary/10">
            {getUserInitials(user?.user_metadata?.name || user?.email || 'You')}
          </AvatarFallback>
        </Avatar>

        {/* Message Input Area */}
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={replyingTo ? `Reply to ${replyingTo.profiles?.name}...` : "Type your message..."}
            disabled={sending || uploading}
            className={cn(
              "min-h-[40px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
              "scrollbar-thin scrollbar-thumb-muted-foreground/20"
            )}
            style={{ height: '40px' }}
            rows={1}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* File upload input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Attachment button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Image button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Image className="h-4 w-4" />
          </Button>

          {/* Emoji button */}
          <Button
            size="sm"
            variant="ghost"
            disabled={sending || uploading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Send button */}
          <Button
            onClick={sendMessage}
            disabled={!canSend}
            size="sm"
            className={cn(
              "h-8 w-8 p-0 transition-all duration-200",
              canSend 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Loading indicator for uploads */}
      {uploading && (
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};