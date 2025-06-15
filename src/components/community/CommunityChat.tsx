
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { chatService, Message } from '@/services/chatService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export const CommunityChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const initialMessages = await chatService.getMessages();
      setMessages(initialMessages);
      setLoading(false);
    };
    fetchMessages();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = chatService.subscribeToMessages(async (payload) => {
      if (payload.new && payload.new.id) {
          const fullMessage = await chatService.getMessageWithProfile(payload.new.id);
          if (fullMessage) {
            setMessages((prevMessages) => [...prevMessages, fullMessage]);
          }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !userId) return;

    const success = await chatService.sendMessage(newMessage, userId);
    if (success) {
      setNewMessage('');
    } else {
        toast({
            title: "Error",
            description: "Could not send message. Please try again.",
            variant: "destructive"
        })
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.user_id === userId ? 'justify-end' : ''}`}>
               {msg.user_id !== userId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(msg.profiles?.name || 'U')}`} />
                  <AvatarFallback>{(msg.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                  msg.user_id === userId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                {msg.user_id !== userId && <p className="text-xs font-semibold mb-1">{msg.profiles?.name || 'Anonymous'}</p>}
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
               {msg.user_id === userId && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(msg.profiles?.name || 'U')}`} />
                    <AvatarFallback>{(msg.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!userId}
            autoComplete="off"
          />
          <Button type="submit" disabled={!userId || newMessage.trim() === ''}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
