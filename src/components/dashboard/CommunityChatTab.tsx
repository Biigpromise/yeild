
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Heart, Share, MoreHorizontal, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { fileUploadService } from '@/services/fileUploadService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ChatPrivacyToggle } from './chat/ChatPrivacyToggle';
import { MediaModal } from './chat/MediaModal';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
    is_anonymous?: boolean;
  } | null;
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
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages...');
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            name,
            profile_picture_url,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      console.log('Raw messages data:', data);
      
      // Process messages with proper error handling for profile data
      const messagesWithProfiles = data?.map(message => {
        console.log('Processing message:', message.id, 'Profile data:', message.profiles);
        
        // Handle case where profiles might be an error or null
        let profileData;
        if (message.profiles && typeof message.profiles === 'object' && !('error' in message.profiles)) {
          const profiles = message.profiles as any; // Type assertion to bypass strict typing
          profileData = {
            name: profiles.name && profiles.name.trim() !== '' 
              ? profiles.name 
              : 'User',
            profile_picture_url: profiles.profile_picture_url || null,
            is_anonymous: profiles.is_anonymous || false
          };
        } else {
          // Fallback profile data if query failed or profile not found
          profileData = {
            name: 'User',
            profile_picture_url: null,
            is_anonymous: false
          };
        }

        return {
          ...message,
          profiles: profileData
        };
      }) || [];
      
      console.log('Final processed messages:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (userId !== user?.id) {
      console.log('Opening profile for user:', userId);
      setSelectedUserId(userId);
      setIsProfileModalOpen(true);
    }
  };

  const handleMediaClick = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
    setMediaModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
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
        console.log('Uploading media file...');
        mediaUrl = await fileUploadService.uploadChatMedia(mediaFile);
        console.log('Media upload result:', mediaUrl);
        if (!mediaUrl) {
          toast.error('Failed to upload media');
          setSending(false);
          return;
        }
      }

      console.log('Inserting message with data:', {
        content: newMessage.trim(),
        user_id: user.id,
        media_url: mediaUrl
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
          ...(mediaUrl && { media_url: mediaUrl })
        });

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }

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

  const getDisplayName = (profiles: any) => {
    if (!profiles) return 'User';
    if (profiles.is_anonymous) return 'Anonymous';
    return profiles.name && profiles.name.trim() !== '' ? profiles.name : 'User';
  };

  const getAvatarFallback = (profiles: any) => {
    const displayName = getDisplayName(profiles);
    return displayName.charAt(0)?.toUpperCase() || 'U';
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
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <h1 className="text-xl font-bold">Community</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{activeUsers} active</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto bg-black">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No posts yet</p>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <div key={message.id} className="border-b border-gray-800 bg-black">
                <div className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUserClick(message.user_id)}
                        className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                      >
                        <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
                          <AvatarImage 
                            src={message.profiles?.profile_picture_url || undefined} 
                            alt={getDisplayName(message.profiles)}
                          />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {getAvatarFallback(message.profiles)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                      
                      <div>
                        <button
                          onClick={() => handleUserClick(message.user_id)}
                          className="font-semibold text-white hover:underline focus:outline-none focus:underline"
                        >
                          {getDisplayName(message.profiles)}
                        </button>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    {message.content && (
                      <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                    
                    {message.media_url && (
                      <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleMediaClick(message.media_url!)}>
                        {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                          <video
                            src={message.media_url}
                            className="w-full max-h-96 object-cover"
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={message.media_url}
                            alt="Post media"
                            className="w-full max-h-96 object-cover hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-6">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                        <Heart className="h-5 w-5 mr-2" />
                        <span className="text-sm">Like</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500 hover:bg-blue-500/10">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Comment</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 hover:bg-green-500/10">
                        <Share className="h-5 w-5 mr-2" />
                        <span className="text-sm">Share</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Creation */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <ChatPrivacyToggle />
        
        {mediaPreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} className="max-h-20 rounded border" />
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-h-20 rounded border" />
              )}
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeMedia}
              >
                ×
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gray-700 text-white">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
              disabled={sending}
            />
            
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="media-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('media-upload')?.click()}
              className="text-gray-400 hover:text-white"
            >
              📷
            </Button>
            
            <Button 
              type="submit" 
              disabled={sending || (!newMessage.trim() && !mediaFile)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
            >
              {sending ? '...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>

      <MediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        mediaUrl={selectedMedia}
      />

      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
};
