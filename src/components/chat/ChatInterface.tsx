
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Image, Heart, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { PublicProfileModal } from '@/components/PublicProfileModal';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

interface ChatEligibility {
  canPost: boolean;
  tasksCompleted: number;
  activeReferrals: number;
  requiredTasks: number;
  requiredReferrals: number;
}

export const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<ChatEligibility | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    checkEligibility();
    fetchMessages();
    setupRealtimeSubscription();
  }, [user]);

  const checkEligibility = async () => {
    if (!user) return;

    try {
      // Set everyone as eligible to post
      setEligibility({
        canPost: true,
        tasksCompleted: 0,
        activeReferrals: 0,
        requiredTasks: 0,
        requiredReferrals: 0,
      });
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

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
          profiles:user_id (
            name,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

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
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              user_id,
              created_at,
              views_count,
              media_url,
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const trackMessageView = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('increment_message_view', {
        message_id_param: messageId,
        user_id_param: user.id
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleProfileClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
          <p className="text-muted-foreground">Sign in to participate in the chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-3 md:p-4 border-b bg-card">
        <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
          Community Chat
        </h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 md:p-4 space-y-3 md:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground">Be the first to start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUserId={user.id}
                  onView={() => trackMessageView(message.id)}
                  onProfileClick={() => handleProfileClick(message.user_id)}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="border-t bg-card">
        <MessageInput onMessageSent={fetchMessages} />
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
