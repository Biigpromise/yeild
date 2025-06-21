
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string | null;
    profile_picture_url?: string;
    tasks_completed?: number;
  } | null;
}

export const chatService = {
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles(
          name,
          profile_picture_url,
          tasks_completed
        )
      `)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching messages:", error);
      toast.error("Could not fetch messages.");
      return [];
    }
    return data as Message[];
  },

  async sendMessage(content: string, userId: string, mediaUrl?: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .insert({ 
        content: content || '', 
        user_id: userId,
        media_url: mediaUrl || null
      });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
      return false;
    }
    return true;
  },

  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message.");
      return false;
    }
    return true;
  },

  async uploadMedia(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to upload files.');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `chat-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading media:', error);
      toast.error(error.message || 'Failed to upload media.');
      return null;
    }
  },

  subscribeToMessages(callback: (payload: any) => void): RealtimeChannel {
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        callback
      )
      .subscribe();

    return channel;
  },

  async getMessageWithProfile(messageId: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles(
          name,
          profile_picture_url,
          tasks_completed
        )
      `)
      .eq('id', messageId)
      .single();
    
    if (error) {
      console.error('Error fetching new message with profile:', error);
      return null;
    }
    return data as Message;
  }
};
