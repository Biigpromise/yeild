import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ImageIcon, Users, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PostItem } from './chat/PostItem';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  likes_count?: number;
  views_count?: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
    is_anonymous?: boolean;
  } | null;
}

interface MessageLike {
  id: string;
  message_id: string;
  user_id: string;
}

export const CommunityChatTab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLikes, setMessageLikes] = useState<Record<string, MessageLike[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { selectedUserId, isModalOpen, openUserProfile, closeUserProfile } = useUserProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    fetchLikes();
    setupRealtimeSubscription();
    setupPresenceTracking();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (name, profile_picture_url, is_anonymous)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages((data || []).reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('message_likes')
        .select('*');

      if (error) throw error;

      const likesMap = (data || []).reduce((acc: Record<string, MessageLike[]>, like: MessageLike) => {
        if (!acc[like.message_id]) {
          acc[like.message_id] = [];
        }
        acc[like.message_id].push(like);
        return acc;
      }, {});

      setMessageLikes(likesMap);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const messagesChannel = supabase
      .channel('messages_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchMessages()
      )
      .subscribe();

    const likesChannel = supabase
      .channel('likes_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'message_likes' },
        () => fetchLikes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(likesChannel);
    };
  };

  const setupPresenceTracking = () => {
    const channel = supabase.channel('community_chat_presence');
    
    if (user) {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setOnlineCount(Object.keys(state).length);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('User joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('User left:', leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

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
          content: '📷 Shared an image',
          media_url: publicUrl,
          user_id: user.id
        });

      if (messageError) throw messageError;
      toast.success('Image shared!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleLike = async (messageId: string) => {
    if (!user) return;

    try {
      const existingLike = messageLikes[messageId]?.find(like => like.user_id === user.id);
      
      if (existingLike) {
        await supabase
          .from('message_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        await supabase
          .from('message_likes')
          .insert({
            message_id: messageId,
            user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const shareText = `Check out this message from ${message.profiles?.name || 'Community Chat'}: "${message.content}"`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Community Message',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Message copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share message');
    }
  };

  const handleMediaClick = (mediaUrl: string) => {
    window.open(mediaUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredMessages = messages.filter(message =>
    !searchQuery || 
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Enhanced Header */}
      <div className="border-b bg-card p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Community Chat</h1>
              <Badge variant="secondary" className="animate-pulse">Live</Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              {onlineCount} online
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Community Chat!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Connect with other members, share your journey, and engage in meaningful conversations.
              </p>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Sign in to start chatting with the community
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMessages.map((message) => {
                const likes = messageLikes[message.id] || [];
                const userHasLiked = likes.some(like => like.user_id === user?.id);
                
                return (
                  <PostItem
                    key={message.id}
                    message={message}
                    likes={likes}
                    userHasLiked={userHasLiked}
                    currentUserId={user?.id}
                    onLike={handleLike}
                    onShare={handleShare}
                    onUserClick={openUserProfile}
                    onMediaClick={handleMediaClick}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Enhanced Message Input */}
      {user && (
        <div className="border-t bg-card p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts with the community..."
                className="pr-12"
              />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              className="hover:bg-primary/10"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="px-6"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{newMessage.length}/1000</span>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUserProfile();
        }}
      />
    </div>
  );
};