
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image, Users, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { fileUploadService } from '@/services/fileUploadService';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

export const CommunityChatTab = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (
            name,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (userId !== user?.id) {
      setSelectedUserId(userId);
      setIsProfileModalOpen(true);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    if (!newMessage.trim() && !mediaFile) {
      toast.error('Please enter a message or select media');
      return;
    }

    setSending(true);
    
    try {
      let mediaUrl: string | null = null;

      if (mediaFile) {
        mediaUrl = await fileUploadService.uploadStoryMedia(mediaFile);
        if (!mediaUrl) {
          toast.error('Failed to upload media');
          return;
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
          ...(mediaUrl && { media_url: mediaUrl })
        });

      if (error) throw error;

      setNewMessage('');
      removeMedia();
      await loadMessages();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeUsers = new Set(messages.map(m => m.user_id)).size;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Please log in to access community chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gray-800 border-b border-gray-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h1 className="text-lg font-bold">Community Chat</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{activeUsers} active</span>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto">
          <div className="p-3 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No messages yet</p>
                <p>Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="cursor-pointer flex-shrink-0" onClick={() => handleUserClick(message.user_id)}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.profiles?.profile_picture_url} />
                      <AvatarFallback className="bg-gray-700 text-white text-sm">
                        {message.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => handleUserClick(message.user_id)}
                        className="font-medium text-sm text-white hover:text-blue-400 transition-colors"
                      >
                        {message.profiles?.name || `User ${message.user_id.substring(0, 8)}`}
                      </button>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2.5 break-words max-w-full">
                      {message.content && (
                        <p className="text-sm text-gray-200 break-words whitespace-pre-wrap">{message.content}</p>
                      )}
                      {message.media_url && (
                        <div className="mt-2">
                          {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                            <video
                              src={message.media_url}
                              controls
                              className="max-w-full max-h-40 rounded border object-cover"
                            />
                          ) : (
                            <img
                              src={message.media_url}
                              alt="Shared media"
                              className="max-w-full max-h-40 rounded border object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed */}
      <div className="flex-shrink-0 border-t border-gray-700 p-3 bg-gray-900">
        {mediaPreview && (
          <div className="mb-2 relative inline-block">
            {mediaFile?.type.startsWith('image/') ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-w-24 max-h-24 rounded border"
              />
            ) : (
              <video
                src={mediaPreview}
                className="max-w-24 max-h-24 rounded border"
                preload="metadata"
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full"
              onClick={removeMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            maxLength={500}
            className="min-h-[50px] max-h-[100px] resize-none flex-1 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          
          <div className="flex flex-col gap-1 flex-shrink-0">
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
              disabled={sending}
              className="border-gray-600 text-white hover:bg-gray-700 w-9 h-9 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={(!newMessage.trim() && !mediaFile) || sending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 w-9 h-9 p-0"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        
        <div className="text-xs text-gray-400 mt-1">
          {newMessage.length}/500 • Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* User Profile Modal */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
};
