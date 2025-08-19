import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ModernMessageBubble } from './ModernMessageBubble';
import { ModernMessageInput } from './ModernMessageInput';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { useUserPresence } from '@/hooks/useUserPresence';
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

export const ModernChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { onlineUsers, typingUsers, onlineCount } = useUserPresence('community_chat');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          user_id,
          created_at,
          views_count,
          media_url,
          message_type,
          chat_id,
          message_context,
          profiles:user_id (
            name,
            profile_picture_url
          )
        `)
        .or(`chat_id.is.null,and(chat_id.not.is.null,message_context.eq.direct)`)
        .in('message_context', ['community', 'direct'])
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`community_messages_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if ((payload.new.chat_id === null && payload.new.message_context === 'community') || 
              (payload.new.chat_id !== null && payload.new.message_context === 'direct')) {
            const { data } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                user_id,
                created_at,
                views_count,
                media_url,
                message_type,
                chat_id,
                message_context,
                profiles:user_id (
                  name,
                  profile_picture_url
                )
              `)
              .eq('id', payload.new.id)
              .maybeSingle();

            if (data) {
              setMessages(prev => [...prev, data]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleProfileClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleMessageSent = () => {
    setReplyingTo(null);
    fetchMessages();
  };

  // Group consecutive messages from the same user
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1];
    const isSameUser = prevMessage && prevMessage.user_id === message.user_id;
    const timeDiff = prevMessage ? 
      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() : 0;
    const isWithinTimeLimit = timeDiff < 5 * 60 * 1000; // 5 minutes

    const isGrouped = isSameUser && isWithinTimeLimit;
    
    acc.push({
      ...message,
      isGrouped,
      isFirstInGroup: !isGrouped,
      isLastInGroup: index === messages.length - 1 || 
        !messages[index + 1] || 
        messages[index + 1].user_id !== message.user_id ||
        new Date(messages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 5 * 60 * 1000
    });

    return acc;
  }, [] as (Message & { isGrouped: boolean; isFirstInGroup: boolean; isLastInGroup: boolean })[]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto"></div>
            <MessageCircle className="h-6 w-6 absolute top-3 left-3 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Loading Community Chat</h3>
            <p className="text-sm text-muted-foreground">Connecting to the conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md mx-4 text-center border-dashed">
          <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to connect with fellow community members and join the conversation
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Modern Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Hash className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Community Chat</h2>
            <p className="text-xs text-muted-foreground">
              Share ideas, connect, and grow together
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {onlineCount} online
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full">
          <div className="px-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                    <MessageCircle className="h-10 w-10 text-primary/60" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 animate-ping"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start the Conversation</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Be the first to share your thoughts and connect with the community!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {groupedMessages.map((message) => (
                  <ModernMessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.user_id === user.id}
                    isGrouped={message.isGrouped}
                    isFirstInGroup={message.isFirstInGroup}
                    isLastInGroup={message.isLastInGroup}
                    onProfileClick={() => handleProfileClick(message.user_id)}
                    onReply={handleReply}
                  />
                ))}
                
                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>
                      {typingUsers.length === 1 
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`
                      }
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modern Message Input */}
      <div className="border-t bg-card/50 backdrop-blur-sm">
        <ModernMessageInput 
          onMessageSent={handleMessageSent}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Profile Modal */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={showProfileModal}
        onOpenChange={setShowProfileModal}
      />
    </div>
  );
};