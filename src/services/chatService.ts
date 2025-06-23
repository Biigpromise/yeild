
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
    console.log('Fetching messages with profiles...');
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_user_id_fkey(
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
    
    console.log('Raw messages from database:', data);
    
    // Transform the data to ensure proper typing and handle null profiles
    const transformedData = data?.map(message => ({
      ...message,
      profiles: message.profiles || { name: 'Anonymous User', profile_picture_url: undefined, tasks_completed: 0 }
    })) || [];
    
    console.log('Transformed messages:', transformedData);
    return transformedData as Message[];
  },

  async sendMessage(content: string, userId: string, mediaUrl?: string): Promise<boolean> {
    try {
      console.log('Sending message:', { content, userId, mediaUrl });
      
      const messageData = {
        content: content || '', 
        user_id: userId,
        media_url: mediaUrl || null
      };
      
      console.log('Message data to insert:', messageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();

      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message.");
        return false;
      }
      
      console.log('Message sent successfully:', data);
      return true;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast.error("Failed to send message.");
      return false;
    }
  },

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error("Error in deleteMessage:", error);
      toast.error("Failed to delete message.");
      return false;
    }
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
      const filePath = `${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size });

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      console.log('File uploaded successfully:', publicUrl);
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
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey(
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
      
      // Transform to ensure proper typing
      const transformedData = {
        ...data,
        profiles: data.profiles || { name: 'Anonymous User', profile_picture_url: undefined, tasks_completed: 0 }
      };
      
      return transformedData as Message;
    } catch (error) {
      console.error('Error in getMessageWithProfile:', error);
      return null;
    }
  }
};
