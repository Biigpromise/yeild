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
import { MessageCommentsModal } from './chat/MessageCommentsModal';
import { Badge } from '@/components/ui/badge';
import { ChatHeader } from './chat/ChatHeader';

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

interface CommunityChatTabProps {
  onToggleNavigation?: () => void;
}

export const CommunityChatTab: React.FC<CommunityChatTabProps> = ({ onToggleNavigation }) => {
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchLikes();
    
    // Set up realtime subscriptions and capture cleanup functions
    const cleanupSubscriptions = setupRealtimeSubscription();
    const cleanupPresence = setupPresenceTracking();
    
    // Return cleanup function to properly remove subscriptions
    return () => {
      if (cleanupSubscriptions) cleanupSubscriptions();
      if (cleanupPresence) cleanupPresence();
    };
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
    if (!user) {
      toast.error('Please log in to like messages');
      return;
    }

    try {
      const existingLike = messageLikes[messageId]?.find(like => like.user_id === user.id);
      
      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('message_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        
        // Update local state optimistically
        setMessageLikes(prev => ({
          ...prev,
          [messageId]: prev[messageId]?.filter(like => like.id !== existingLike.id) || []
        }));
        toast.success('Like removed');
      } else {
        // Like
        const { data, error } = await supabase
          .from('message_likes')
          .insert({
            message_id: messageId,
            user_id: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Update local state optimistically
        setMessageLikes(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), data]
        }));
        toast.success('Message liked!');
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
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header with Navigation */}
      <ChatHeader activeUsers={onlineCount} onToggleNavigation={onToggleNavigation} />
      
      {/* Search Bar */}
      <div className="border-b bg-card/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 md:h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden bg-muted/10">
        <ScrollArea className="h-full">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 md:p-8">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">💬</div>
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-foreground">Welcome to Community Chat!</h2>
              <p className="text-muted-foreground mb-6 max-w-md leading-relaxed text-sm md:text-base">
                Connect with other members, share your journey, and engage in meaningful conversations.
              </p>
              {!user && (
                <div className="p-3 md:p-4 bg-card rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    Sign in to start chatting with the community
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-1 md:py-2 space-y-1 md:space-y-2">
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
                    onOpenCommentsModal={(message) => {
                      setSelectedMessage(message);
                      setIsCommentsModalOpen(true);
                    }}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-2 md:h-4" />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Enhanced Message Input */}
      {user && (
        <div className="border-t bg-card/80 backdrop-blur-sm p-3 md:p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts with the community..."
                  className="pr-12 min-h-[44px] resize-none"
                  maxLength={1000}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                  {newMessage.length}/1000
                </div>
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
                className="h-11 w-11 hover:bg-primary/10 flex-shrink-0"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">Upload media</span>
              </Button>
              
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="h-11 px-6 font-medium flex-shrink-0"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            
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

      {/* Comments Modal */}
      {selectedMessage && (
        <MessageCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false);
            setSelectedMessage(null);
          }}
          message={selectedMessage}
          userId={user?.id || null}
          onUserClick={openUserProfile}
        />
      )}
    </div>
  );
};