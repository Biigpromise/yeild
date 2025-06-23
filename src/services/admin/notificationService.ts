
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotificationRequest {
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  userIds?: string[];
}

export const notificationService = {
  async sendNotification(request: NotificationRequest): Promise<boolean> {
    try {
      console.log('Sending notification with data:', request);

      // Call the edge function to send notifications
      const { data, error } = await supabase.functions.invoke('send-user-notification', {
        body: request
      });

      if (error) {
        console.error('Error calling edge function:', error);
        throw error;
      }

      console.log('Notification sent successfully:', data);
      
      // Show success message
      toast.success(`Notification sent successfully! ${data?.message || ''}`);
      
      return true;
    } catch (error) {
      console.error('Error in notificationService.sendNotification:', error);
      toast.error('Failed to send notification');
      throw error;
    }
  },

  async getAllNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          profiles!notifications_user_id_fkey (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      throw error;
    }
  }
};
