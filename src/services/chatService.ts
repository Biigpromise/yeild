
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string | null;
  } | null;
}

export const chatService = {
  async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(name)')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching messages:", error);
      toast.error("Could not fetch messages.");
      return [];
    }
    return data as Message[];
  },

  async sendMessage(content: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .insert({ content, user_id: userId });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message.");
      return false;
    }
    return true;
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
      .select('*, profiles(name)')
      .eq('id', messageId)
      .single();
    
    if (error) {
      console.error('Error fetching new message with profile:', error);
      return null;
    }
    return data as Message;
  }
};
