import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import { TypingIndicator } from "./TypingIndicator";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string;
  reactions?: Array<{ emoji: string; userId: string; userName: string }>;
  isEdited?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

interface ChatWindowProps {
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

export const ChatWindow = ({
  chatId,
  chatName,
  isGroupChat,
  participants,
  onClose
}: ChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
    return () => {
      // Cleanup subscription
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      // For now, use mock data since tables are being created
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          content: "Hello! How are you doing today?",
          senderId: "user1",
          senderName: "John Doe",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          messageType: "text",
          reactions: [
            { emoji: "👍", userId: "user2", userName: "You" }
          ]
        },
        {
          id: "2",
          content: "I'm doing great, thanks for asking! Just working on some exciting projects.",
          senderId: user?.id || "current_user",
          senderName: "You",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          messageType: "text"
        },
        {
          id: "3",
          content: "That sounds awesome! What kind of projects?",
          senderId: "user1",
          senderName: "John Doe", 
          timestamp: new Date(Date.now() - 900000).toISOString(),
          messageType: "text",
          replyTo: {
            id: "2",
            content: "I'm doing great, thanks for asking!",
            senderName: "You"
          }
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          // Handle new message
          loadMessages(); // Reload to get sender info
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          // Handle message updates (reactions, edits)
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // For now, just add the message to local state
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: messageContent,
        senderId: user.id,
        senderName: "You",
        timestamp: new Date().toISOString(),
        messageType: "text",
        replyTo: replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          senderName: replyingTo.senderName
        } : undefined
      };

      setMessages(prev => [...prev, newMessage]);
      setReplyingTo(null);
      inputRef.current?.focus();
      
      toast.success("Message sent!");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageContent); // Restore message
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const existingReaction = messages
        .find(m => m.id === messageId)
        ?.reactions?.find(r => r.userId === user.id && r.emoji === emoji);

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji
          });
      }
    } catch (error) {
      console.error('Error managing reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onlineParticipants = participants.filter(p => p.isOnline);

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Chat Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={participants[0]?.avatar} />
              <AvatarFallback>
                {isGroupChat ? chatName.slice(0, 2).toUpperCase() : participants[0]?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{chatName}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isGroupChat ? (
                  <span>{participants.length} members</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${participants[0]?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
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
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4">
          {loading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === user?.id}
                  showAvatar={
                    index === 0 || 
                    messages[index - 1].senderId !== message.senderId ||
                    new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000
                  }
                  onReact={(emoji) => addReaction(message.id, emoji)}
                  onReply={() => setReplyingTo(message)}
                />
              ))}
              <TypingIndicator users={typing} />
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted border-t border-b">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Replying to {replyingTo.senderName}</span>
              <p className="text-muted-foreground truncate max-w-md">
                {replyingTo.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 z-10">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>
    </Card>
  );
};