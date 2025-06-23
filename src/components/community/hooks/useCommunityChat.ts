
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
    tasks_completed?: number;
  };
}

export const useCommunityChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      // Ensure user profile exists when they access chat
      chatService.ensureUserProfile(user.id);
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages();
      console.log('Loaded messages with profiles:', data);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Send message clicked', { newMessage: newMessage.trim(), selectedFile, user, sending });
    
    if ((!newMessage.trim() && !selectedFile) || sending || !user) {
      console.log('Cannot send message:', { 
        hasContent: !!newMessage.trim(), 
        hasFile: !!selectedFile, 
        sending, 
        hasUser: !!user 
      });
      return;
    }

    try {
      setSending(true);
      console.log('Starting to send message...');
      
      let mediaUrl: string | undefined;
      if (selectedFile) {
        setUploading(true);
        console.log('Uploading file...');
        mediaUrl = await chatService.uploadMedia(selectedFile);
        setUploading(false);
        console.log('File uploaded:', mediaUrl);
        
        if (!mediaUrl) {
          toast.error('Failed to upload file');
          return;
        }
      }

      console.log('Sending message to service...', { content: newMessage.trim(), userId: user.id, mediaUrl });
      const success = await chatService.sendMessage(newMessage.trim(), user.id, mediaUrl);
      
      if (success) {
        console.log('Message sent successfully');
        setNewMessage('');
        removeFile();
        // Immediate reload to show the new message
        await loadMessages();
        toast.success('Message sent!');
      } else {
        console.log('Failed to send message');
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string, messageUserId: string) => {
    if (!user || user.id !== messageUserId) {
      toast.error('You can only delete your own messages');
      return;
    }

    try {
      const success = await chatService.deleteMessage(messageId);
      if (success) {
        toast.success('Message deleted');
        await loadMessages();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  return {
    user,
    messages,
    newMessage,
    setNewMessage,
    loading,
    sending,
    selectedFile,
    filePreview,
    uploading,
    messagesEndRef,
    handleFileSelect,
    removeFile,
    handleSendMessage,
    handleDeleteMessage
  };
};
