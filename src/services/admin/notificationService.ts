
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotificationData {
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  userIds?: string[];
}

export const notificationService = {
  async sendNotification(notificationData: NotificationData): Promise<boolean> {
    try {
      console.log('Sending notification:', notificationData);

      // Call the edge function to send notifications
      const { data, error } = await supabase.functions.invoke('send-user-notification', {
        body: notificationData
      });

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('Failed to send notification');
        return false;
      }

      console.log('Notification sent successfully:', data);
      toast.success('Notification sent successfully!');
      return true;
    } catch (error) {
      console.error('Error in sendNotification:', error);
      toast.error('Failed to send notification');
      return false;
    }
  },

  async getAllNotifications(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      return [];
    }
  }
};
