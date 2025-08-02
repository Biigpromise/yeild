
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Image, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  media_url?: string;
  views_count: number;
  profiles?: {
    name: string;
    profile_picture_url?: string;
  };
}

export const CommunityChatTab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [canPost, setCanPost] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkPostingEligibility();
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Real-time message update:', payload);
          if (payload.eventType === 'INSERT') {
            fetchMessages(); // Refetch to get profile data
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkPostingEligibility = async () => {
    if (!user) return;

    try {
      // Allow everyone to post in chat
      setCanPost(true);
    } catch (error) {
      console.error('Error checking posting eligibility:', error);
      setCanPost(true); // Still allow posting even if there's an error
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles (name, profile_picture_url)
        `)
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
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
          content: '📷 Image',
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

  const incrementMessageView = async (messageId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('increment_message_view', {
        message_id_param: messageId,
        user_id_param: user.id
      });
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Community Chat</h2>
        <p className="text-muted-foreground">
          Connect with other members and share your journey.
        </p>
      </div>

      <Card className="h-full max-h-[600px] flex flex-col bg-black border-gray-800">
        {/* Messages Container */}
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:bg-gray-800 transition-colors"
                  onClick={() => incrementMessageView(message.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {message.profiles?.profile_picture_url ? (
                        <img
                          src={message.profiles.profile_picture_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {message.profiles?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">
                          {message.profiles?.name || 'Anonymous'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </span>
                        {message.views_count > 0 && (
                          <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                            {message.views_count} views
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-gray-200">
                        {message.content}
                        {message.media_url && (
                          <img
                            src={message.media_url}
                            alt="Shared media"
                            className="mt-2 max-w-sm rounded-lg border border-gray-700"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">Welcome to Community Chat!</h3>
                  <p className="text-gray-400">Be the first to start a conversation.</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Message Input */}
        <div className="bg-gray-900 border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:bg-gray-700"
              />
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800 border border-gray-700"
            >
              <Image className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
