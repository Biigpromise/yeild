import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SendMessageOptions {
  content: string;
  chatId?: string | null;
  messageContext?: string;
  messageType?: 'text' | 'image' | 'voice' | 'file';
  mediaUrl?: string;
  parentMessageId?: string;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  media_url?: string;
  message_type?: string;
  chat_id?: string | null;
  message_context?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

class MessageService {
  async sendMessage(options: SendMessageOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: options.content,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          chat_id: options.chatId || null,
          message_context: options.messageContext || 'community',
          message_type: options.messageType || 'text',
          media_url: options.mediaUrl,
          parent_message_id: options.parentMessageId
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        
        if (error.code === '42501') {
          return { 
            success: false, 
            error: 'You need to complete at least 1 task and have 3 active referrals to post in chat.' 
          };
        } else if (error.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'Authentication required. Please refresh and try again.' 
          };
        } else {
          return { 
            success: false, 
            error: 'Failed to send message. Please try again.' 
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error sending message:', error);
      return { 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      };
    }
  }

  async uploadAndSendImage(file: File, options: Omit<SendMessageOptions, 'content' | 'mediaUrl' | 'messageType'>): Promise<{ success: boolean; error?: string }> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 5MB' };
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(uploadData.path);

      return await this.sendMessage({
        content: `📷 ${file.name}`,
        mediaUrl: publicUrl,
        messageType: 'image',
        ...options
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return { 
        success: false, 
        error: 'Failed to upload image. Please try again.' 
      };
    }
  }

  async fetchCommunityMessages(): Promise<{ messages: Message[]; error?: string }> {
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
        .is('chat_id', null)
        .eq('message_context', 'community')
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return { messages: data || [] };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { 
        messages: [], 
        error: 'Failed to load messages' 
      };
    }
  }

  setupRealtimeSubscription(onNewMessage: (message: Message) => void) {
    const channel = supabase
      .channel('community_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'chat_id=is.null'
        },
        async (payload) => {
          if (payload.new.chat_id === null && payload.new.message_context === 'community') {
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
              onNewMessage(data);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async trackMessageView(messageId: string): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      await supabase.rpc('increment_message_view', {
        message_id_param: messageId,
        user_id_param: user.id
      });
    } catch (error) {
      console.error('Error tracking message view:', error);
    }
  }
}

export const messageService = new MessageService();