
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
import { MessagesList } from './MessagesList';
import { MessageInputForm } from './MessageInputForm';

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

export const CommunityChat = () => {
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
          setSending(false);
          return;
        }
      }

      console.log('Sending message to service...', { content: newMessage.trim(), userId: user.id, mediaUrl });
      const success = await chatService.sendMessage(newMessage.trim(), user.id, mediaUrl);
      
      if (success) {
        console.log('Message sent successfully');
        setNewMessage('');
        removeFile();
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

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center bg-gray-900 border-gray-700">
        <CardContent>
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-white" />
            <p className="text-gray-300">Please log in to access community chat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center bg-gray-900 border-gray-700">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-300">Loading community chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gray-900 border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="h-5 w-5" />
          Community Chat
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{new Set(messages.map(m => m.user_id)).size} active</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <MessagesList
          messages={messages}
          currentUserId={user?.id}
          onDeleteMessage={handleDeleteMessage}
          messagesEndRef={messagesEndRef}
        />

        <MessageInputForm
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedFile={selectedFile}
          filePreview={filePreview}
          sending={sending}
          uploading={uploading}
          onSubmit={handleSendMessage}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
        />
      </CardContent>
    </Card>
  );
};
