import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Info,
  X,
  Users,
  ArrowLeft,
  Image as ImageIcon,
  Reply
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface DirectMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  message_type: string;
  media_url?: string;
  reply_to_id?: string;
  is_edited: boolean;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
  reply_to?: {
    id: string;
    content: string;
    profiles: {
      name: string;
    };
  };
}

interface ModernChatWindowProps {
  chatId: string;
  chatName: string;
  isGroupChat: boolean;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  onClose: () => void;
}

export const ModernChatWindow = ({
  chatId,
  chatName,
  isGroupChat,
  participants,
  onClose
}: ModernChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    const cleanup = setupRealtimeSubscription();
    markAsRead();
    return cleanup;
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // First get messages with user data
      const { data: messagesData, error: messagesError } = await supabase
        .from('direct_messages')
        .select(`
          id,
          content,
          user_id,
          created_at,
          message_type,
          media_url,
          reply_to_id,
          is_edited
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        toast.error('Failed to load messages');
        return;
      }

      if (!messagesData) {
        setMessages([]);
        return;
      }

      // Get user profiles for messages
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .in('id', userIds);

      // Get reply-to messages
      const replyToIds = messagesData.filter(m => m.reply_to_id).map(m => m.reply_to_id);
      let replyToData: any[] = [];
      if (replyToIds.length > 0) {
        const { data } = await supabase
          .from('direct_messages')
          .select('id, content, user_id')
          .in('id', replyToIds);
        replyToData = data || [];
      }

      // Combine data
      const processedMessages: DirectMessage[] = messagesData.map(message => {
        const profile = profilesData?.find(p => p.id === message.user_id);
        const replyTo = replyToData.find(r => r.id === message.reply_to_id);
        const replyToProfile = replyTo ? profilesData?.find(p => p.id === replyTo.user_id) : null;

        return {
          ...message,
          profiles: {
            name: profile?.name || 'Unknown User',
            profile_picture_url: profile?.profile_picture_url
          },
          reply_to: replyTo ? {
            id: replyTo.id,
            content: replyTo.content,
            profiles: {
              name: replyToProfile?.name || 'Unknown User'
            }
          } : undefined
        };
      });

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
      .channel(`direct_chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => loadMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('direct_chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', user.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const { error } = await supabase
        .from('direct_messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          content: messageContent,
          message_type: 'text',
          reply_to_id: replyingTo?.id
        });

      if (error) throw error;

      // Update last message timestamp on chat
      await supabase
        .from('direct_chats')
        .update({ 
          last_message_at: new Date().toISOString()
        })
        .eq('id', chatId);

      setReplyingTo(null);
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMessage = (message: DirectMessage, index: number) => {
    const isOwn = message.user_id === user?.id;
    const showAvatar = index === 0 || 
      messages[index - 1].user_id !== message.user_id ||
      new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;

    return (
      <div
        key={message.id}
        className={`flex items-end gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'} mb-4`}
      >
        {showAvatar ? (
          <Avatar className="w-8 h-8 ring-2 ring-background">
            <AvatarImage src={message.profiles.profile_picture_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs">
              {message.profiles.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8" />
        )}

        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {showAvatar && (
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs font-medium text-foreground">
                {isOwn ? 'You' : message.profiles.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          )}

          {message.reply_to && (
            <div className={`mb-2 ${isOwn ? 'self-end' : 'self-start'}`}>
              <div className="bg-muted/50 backdrop-blur-sm border border-border/50 rounded-lg p-2 text-xs">
                <div className="font-medium text-muted-foreground mb-1">
                  Replying to {message.reply_to.profiles.name}
                </div>
                <div className="text-muted-foreground truncate max-w-[200px]">
                  {message.reply_to.content}
                </div>
              </div>
            </div>
          )}

          <div
            className={`relative group/message px-4 py-2 rounded-2xl max-w-full backdrop-blur-sm transition-all duration-200 ${
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-background/80 border border-border/50 text-foreground rounded-bl-md hover:bg-background/90'
            }`}
          >
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </div>

            {message.is_edited && (
              <div className="text-xs text-muted-foreground mt-1 opacity-70">
                edited
              </div>
            )}

            {/* Message actions */}
            <div 
              className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200 ${
                isOwn ? 'left-2' : 'right-2'
              }`}
            >
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-md p-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setReplyingTo(message)}
                >
                  <Reply className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Smile className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onlineParticipants = participants.filter(p => p.isOnline);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="md:hidden h-8 w-8 p-0"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="w-10 h-10 ring-2 ring-background">
              <AvatarImage src={participants[0]?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                {isGroupChat ? (
                  <Users className="h-5 w-5" />
                ) : (
                  participants[0]?.name?.slice(0, 2).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-foreground">{chatName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isGroupChat ? (
                  <span>{participants.length} members</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${participants[0]?.isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <span>{participants[0]?.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                )}
                {onlineParticipants.length > 0 && isGroupChat && (
                  <Badge variant="secondary" className="text-xs">
                    {onlineParticipants.length} online
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Info className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="hidden md:flex h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-12 bg-muted rounded-2xl w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Start the conversation
              </h3>
              <p className="text-muted-foreground">
                Send a message to get the conversation started with {chatName}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-3 bg-muted/50 backdrop-blur-sm border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground mb-1">
                Replying to {replyingTo.user_id === user?.id ? 'You' : replyingTo.profiles.name}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {replyingTo.content}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${chatName}...`}
              className="pr-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-full"
              disabled={sending}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
            className="h-8 w-8 p-0 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};