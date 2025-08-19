import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  EnhancedMessage, 
  MessageReaction, 
  MessageMention, 
  TypingUser, 
  UserPresence 
} from '@/types/chat';

export const useEnhancedChat = (chatId: string = 'community') => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<EnhancedMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<EnhancedMessage | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const presenceChannelRef = useRef<any>();

  // Fetch enhanced messages with reactions, mentions, and replies
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      
      const selectQuery = `
        *,
        profiles (name, profile_picture_url, is_anonymous),
        message_reactions (id, emoji, user_id, created_at),
        message_mentions (id, mentioned_user_id, is_read, created_at)
      `;

      let data: any, error: any;
      
      if (chatId === 'community') {
        const result = await (supabase as any).from('messages').select(selectQuery).eq('is_deleted', false).or('chat_id.is.null,chat_id.eq.community').order('created_at', { ascending: false }).limit(50);
        data = result.data;
        error = result.error;
      } else {
        const result = await (supabase as any).from('messages').select(selectQuery).eq('is_deleted', false).eq('chat_id', chatId).order('created_at', { ascending: false }).limit(50);
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Fetch replies for each message
        const messagesWithReplies = await Promise.all(
        (data || []).map(async (message) => {
          const { data: replies } = await supabase
            .from('messages')
            .select(`
              *,
              profiles (name, profile_picture_url, is_anonymous)
            `)
            .eq('parent_message_id', message.id)
            .order('created_at', { ascending: true });

          return {
            ...message,
            updated_at: message.created_at,
            message_type: (message.message_type || 'text') as 'text' | 'image' | 'voice' | 'file',
            reactions: message.message_reactions || [],
            mentions: message.message_mentions || [],
            replies: (replies || []).map(reply => ({
              ...reply,
              updated_at: reply.created_at,
              message_type: (reply.message_type || 'text') as 'text' | 'image' | 'voice' | 'file'
            }))
          };
        })
      );

      setMessages(messagesWithReplies.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Setup real-time subscriptions
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        
        // Build query based on chat type to avoid TypeScript infinite type issue
        const selectQuery = `
          *,
          profiles (name, profile_picture_url, is_anonymous),
          message_reactions (id, emoji, user_id, created_at),
          message_mentions (id, mentioned_user_id, is_read, created_at)
        `;

        let data, error;
        
      if (chatId === 'community') {
        const result = await (supabase as any)
          .from('messages')
          .select(selectQuery)
          .eq('is_deleted', false)
          .is('chat_id', null)
          .eq('message_context', 'community')
          .order('created_at', { ascending: false })
          .limit(50);
        data = result.data;
        error = result.error;
      } else {
        const result = await (supabase as any)
          .from('messages')
          .select(selectQuery)
          .eq('is_deleted', false)
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(50);
        data = result.data;
        error = result.error;
      }
        if (error) throw error;

        setMessages((data || []).reverse().map(msg => ({
          ...msg,
          message_type: (msg.message_type || 'text') as 'text' | 'image' | 'voice' | 'file',
          reactions: msg.message_reactions || [],
          mentions: msg.message_mentions || [],
          replies: []
        })));
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Only set up subscriptions if we don't already have them
    if (!user?.id) return;

    // Create subscription management with unique identifiers
    const subscriptionId = `${chatId}_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Message subscriptions with unique channel names to prevent "subscribe multiple times" error
    const messageChannel = supabase
      .channel(`messages_${subscriptionId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as any; // Use any to avoid type issues with payload
          // Filter messages based on chat type
          if (chatId === 'community' && newMessage.chat_id === null && newMessage.message_context === 'community') {
            setMessages(prev => [...prev, { ...newMessage, reactions: [], mentions: [], replies: [] }]);
          } else if (chatId !== 'community' && newMessage.chat_id === chatId) {
            setMessages(prev => [...prev, { ...newMessage, reactions: [], mentions: [], replies: [] }]);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updatedMessage = payload.new as any; // Use any to avoid type issues
          setMessages(prev => prev.map(msg => 
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
          ));
        }
      )
      .subscribe();

    // Reaction subscriptions
    const reactionChannel = supabase
      .channel(`reactions_${subscriptionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          // Update reactions in real-time without full refetch
          setMessages(prev => [...prev]);
        }
      )
      .subscribe();

    // Typing indicators
    const typingChannel = supabase
      .channel(`typing_indicators_${subscriptionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'typing_indicators' },
        async () => {
          const { data } = await supabase
            .from('typing_indicators')
            .select('user_id')
            .eq('chat_id', chatId)
            .eq('is_typing', true)
            .gt('expires_at', new Date().toISOString())
            .neq('user_id', user?.id || '');

          if (data) {
            const userIds = data.map(item => item.user_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, name, profile_picture_url')
              .in('id', userIds);

            setTypingUsers(profiles?.map(profile => ({
              user_id: profile.id,
              name: profile.name || 'Anonymous',
              avatar: profile.profile_picture_url
            })) || []);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(reactionChannel);
        supabase.removeChannel(typingChannel);
      } catch (error) {
        console.warn('Channel cleanup warning:', error);
      }
    };
  }, [chatId, user?.id]);

  // User presence management
  useEffect(() => {
    if (!user?.id) return;

    const setupPresence = async () => {
      // Update user presence to online
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'online',
          is_online: true,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      // Subscribe to presence changes with unique channel name
      const presenceChannelName = `presence_${chatId}_${user.id}_${Date.now()}`;
      presenceChannelRef.current = supabase
        .channel(presenceChannelName)
        .on('presence', { event: 'sync' }, () => {
          fetchOnlineUsers();
        })
        .on('presence', { event: 'join' }, () => {
          fetchOnlineUsers();
        })
        .on('presence', { event: 'leave' }, () => {
          fetchOnlineUsers();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannelRef.current?.track({
              user_id: user.id,
              online_at: new Date().toISOString()
            });
          }
        });
    };

    const fetchOnlineUsers = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .eq('is_online', true);
      
      setOnlineUsers(data || []);
    };

    setupPresence();

    // Handle beforeunload to set offline status
    const handleBeforeUnload = async () => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'offline',
          is_online: false,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [user?.id, chatId]);

  // Send typing indicator
  const handleTyping = useCallback(async (isTyping: boolean) => {
    if (!user?.id) return;

    try {
      if (isTyping) {
        await supabase
          .from('typing_indicators')
          .upsert({
            user_id: user.id,
            chat_id: chatId,
            is_typing: true,
            last_typed_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5000).toISOString() // 5 seconds
          });

        // Clear typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 3000);
      } else {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('user_id', user.id)
          .eq('chat_id', chatId);
      }
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }, [user?.id, chatId]);

  // Send message (enhanced)
  const sendMessage = useCallback(async (
    content: string,
    options: {
      type?: 'text' | 'image' | 'voice' | 'file';
      mediaUrl?: string;
      voiceDuration?: number;
      parentMessageId?: string;
      mentions?: string[];
    } = {}
  ) => {
    if (!user?.id || (!content.trim() && !options.mediaUrl)) return;

    try {
      const messageData = {
        content: content.trim(),
        user_id: user.id,
        message_type: options.type || 'text',
        media_url: options.mediaUrl,
        voice_duration: options.voiceDuration,
        parent_message_id: options.parentMessageId,
        chat_id: chatId === 'community' ? null : chatId // null for community, specific ID for private chats
      };

      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Handle mentions
      if (options.mentions && options.mentions.length > 0) {
        const mentionData = options.mentions.map(userId => ({
          message_id: newMessage.id,
          mentioned_user_id: userId,
          mentioned_by_user_id: user.id
        }));

        await supabase
          .from('message_mentions')
          .insert(mentionData);
      }

      // Clear typing indicator
      handleTyping(false);
      
      // Clear reply state
      setReplyToMessage(null);
      
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [user?.id, handleTyping]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user?.id) return;

    try {
      // Get original message for edit history
      const { data: originalMessage } = await supabase
        .from('messages')
        .select('content')
        .eq('id', messageId)
        .single();

      if (originalMessage) {
        // Save edit history
        await supabase
          .from('message_edit_history')
          .insert({
            message_id: messageId,
            previous_content: originalMessage.content,
            edited_by: user.id
          });

        // Update message
        const { error } = await supabase
          .from('messages')
          .update({
            content: newContent,
            is_edited: true,
            last_edited_at: new Date().toISOString()
          })
          .eq('id', messageId)
          .eq('user_id', user.id);

        // Update edit count separately
        const { data: currentMessage } = await supabase
          .from('messages')
          .select('edit_count')
          .eq('id', messageId)
          .single();
        
        if (currentMessage) {
          await supabase
            .from('messages')
            .update({ edit_count: (currentMessage.edit_count || 0) + 1 })
            .eq('id', messageId);
        }

        if (error) throw error;
        
        setEditingMessage(null);
        toast.success('Message updated!');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  }, [user?.id]);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user?.id) return;

    try {
      // Toggle reaction
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);
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
      console.error('Error toggling reaction:', error);
    }
  }, [user?.id]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      // Optimistically remove from UI first
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) {
        // Revert the optimistic update on error by refetching
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            profiles (name, profile_picture_url, is_anonymous),
            message_reactions (id, emoji, user_id, created_at),
            message_mentions (id, mentioned_user_id, is_read, created_at)
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (data) {
          setMessages(data.reverse() as EnhancedMessage[]);
        }
        throw error;
      }
      
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('message_read_receipts')
        .upsert({
          message_id: messageId,
          user_id: user.id
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [user?.id]);

  return {
    messages,
    loading,
    typingUsers,
    onlineUsers,
    sendMessage,
    addReaction,
    deleteMessage,
    markAsRead,
    handleTyping
  };
};