import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { ChatUserBadge } from './ChatUserBadge';

const CommunityChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('community_messages')
          .select(`
            *,
            profiles (
              name,
              profile_picture_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching messages:', error);
          toast.error('Failed to load messages');
        } else {
          setMessages(data?.reverse() || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      }
    };

    fetchInitialMessages();

    const messageSubscription = supabase
      .channel('public:community_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          const newMessage = payload.new;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [user]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert([
          {
            user_id: user.id,
            content: newMessage,
          },
        ]);

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const renderMessage = (message: any) => (
    <div key={message.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <ChatUserBadge
        userId={message.user_id}
        userName={message.profiles?.name || 'Anonymous'}
        userAvatar={message.profiles?.profile_picture_url}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 break-words">{message.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Community Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <div
          ref={chatContainerRef}
          className="overflow-y-auto flex-grow mb-2 p-1"
          style={{ maxHeight: '400px' }}
        >
          {messages.map(renderMessage)}
        </div>

        <div className="mt-auto">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>
              Send <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityChat;
