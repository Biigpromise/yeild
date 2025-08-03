import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble, Message } from './MessageBubble';
import { TypingIndicator } from '../messaging/TypingIndicator';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Paperclip, 
  Image, 
  X,
  Search,
  Users,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedChatWindowProps {
  chatId?: string;
  chatName?: string;
  onClose?: () => void;
  className?: string;
}

export const EnhancedChatWindow: React.FC<EnhancedChatWindowProps> = ({
  chatId = 'general',
  chatName = 'General Chat',
  onClose,
  className
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { 
    onlineUsers, 
    typingUsers, 
    broadcastTyping,
    onlineCount 
  } = useUserPresence(chatId);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_user_id_fkey(id, name, profile_picture_url)
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const processedMessages = (data || []).map((msg: any) => ({
        ...msg,
        sender_id: msg.user_id,
        sender: msg.sender
      }));
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    try {
      const messageData = {
        content: inputValue.trim(),
        user_id: user.id,
        chat_id: chatId,
        message_type: 'text',
        reply_to_message_id: replyToMessage?.id || null
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setInputValue('');
      setReplyToMessage(null);
      broadcastTyping(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.code === '42501') {
        toast.error('You need to complete at least 1 task and have 3 active referrals to post in chat.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Broadcast typing status
    if (value.trim()) {
      broadcastTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTyping(false);
      }, 3000);
    } else {
      broadcastTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Add reaction logic here - would need a reactions table
      console.log('Adding reaction:', messageId, emoji);
      toast.success('Reaction added!');
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    inputRef.current?.focus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredMessages = searchTerm
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  if (loading) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading messages...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`flex-1 flex flex-col h-full ${className}`}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                {chatName}
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {onlineCount} online
                </Badge>
              </h3>
              {typingUsers.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {typingUsers.map(u => u.username).join(', ')} 
                  {typingUsers.length === 1 ? ' is typing...' : ' are typing...'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
        )}
      </CardHeader>

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="border-b p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Online:</span>
            {onlineUsers.slice(0, 10).map((user) => (
              <div key={user.userId} className="flex items-center gap-1 whitespace-nowrap">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{user.username}</span>
              </div>
            ))}
            {onlineUsers.length > 10 && (
              <span className="text-xs text-muted-foreground">
                +{onlineUsers.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {filteredMessages.map((message, index) => {
              const isCurrentUser = message.sender_id === user?.id;
              const showAvatar = index === 0 || 
                filteredMessages[index - 1]?.sender_id !== message.sender_id;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showAvatar={showAvatar}
                  onReaction={handleReaction}
                  onReply={handleReply}
                />
              );
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <TypingIndicator 
                users={typingUsers.map(u => u.username)} 
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">Replying to</div>
              <div className="font-medium text-xs">{replyToMessage.sender?.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {replyToMessage.content}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setReplyToMessage(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Image className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none"
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};