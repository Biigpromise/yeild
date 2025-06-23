import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, MessageCircle, Trash2, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { toast } from 'sonner';
import { ChatUserBadge } from './ChatUserBadge';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const removeFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending || !user) return;

    try {
      setSending(true);
      
      let mediaUrl: string | undefined;
      if (selectedFile) {
        setUploading(true);
        toast.loading('Uploading file...');
        mediaUrl = await chatService.uploadMedia(selectedFile);
        toast.dismiss();
        setUploading(false);
        
        if (!mediaUrl) {
          toast.error('Failed to upload file');
          setSending(false);
          return;
        }
      }

      const success = await chatService.sendMessage(newMessage.trim(), user.id, mediaUrl);
      if (success) {
        setNewMessage('');
        removeFile();
        await loadMessages();
        toast.success('Message sent!');
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

  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const isImage = (url: string) => {
    return url && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp'));
  };

  const isVideo = (url: string) => {
    return url && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov'));
  };

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Please log in to access community chat</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading community chat...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Chat
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{new Set(messages.map(m => m.user_id)).size} active</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const displayName = message.profiles?.name || 'Anonymous User';
                console.log('Rendering message with user data:', { 
                  userId: message.user_id, 
                  profileName: message.profiles?.name,
                  displayName,
                  hasProfile: !!message.profiles
                });
                
                return (
                  <div key={message.id} className="flex items-start space-x-3 group">
                    <ChatUserBadge
                      userId={message.user_id}
                      userName={displayName}
                      userAvatar={message.profiles?.profile_picture_url}
                      userTasksCompleted={message.profiles?.tasks_completed || 0}
                      size="sm"
                      showBirdBadge={true}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.created_at)}
                        </span>
                        {user && user.id === message.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id, message.user_id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        {message.content && (
                          <p className="text-sm break-words mb-2">{message.content}</p>
                        )}
                        {message.media_url && (
                          <div className="mt-2">
                            {isImage(message.media_url) && (
                              <img
                                src={message.media_url}
                                alt="Shared media"
                                className="max-w-full max-h-48 rounded-lg border object-cover"
                                loading="lazy"
                              />
                            )}
                            {isVideo(message.media_url) && (
                              <video
                                src={message.media_url}
                                controls
                                className="max-w-full max-h-48 rounded-lg border"
                                preload="metadata"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          {filePreview && (
            <div className="mb-3 relative inline-block">
              {selectedFile?.type.startsWith('image/') ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-32 max-h-32 rounded-lg border"
                />
              ) : (
                <video
                  src={filePreview}
                  className="max-w-32 max-h-32 rounded-lg border"
                  preload="metadata"
                />
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={removeFile}
              >
                ×
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending || uploading}
                maxLength={500}
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploading}
                className="px-3"
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
              size="sm"
            >
              {sending || uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2">
            {newMessage.length}/500 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
