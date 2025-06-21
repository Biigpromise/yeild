
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationData {
  title: string;
  content: string;
  type?: string;
  announcementId?: string;
}

export const notificationService = {
  // Send notification to specific users
  async sendNotificationToUsers(userIds: string[], notificationData: NotificationData) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: notificationData.title,
        content: notificationData.content,
        type: notificationData.type || 'info',
        announcement_id: notificationData.announcementId || null
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      console.log(`Notifications sent to ${userIds.length} users`);
      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  },

  // Send notification to all users based on target audience
  async sendBroadcastNotification(targetAudience: string, notificationData: NotificationData) {
    try {
      // Get users based on target audience
      let userQuery = supabase.from('profiles').select('id');

      switch (targetAudience) {
        case 'active':
          userQuery = userQuery.gte('last_active_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
          break;
        case 'inactive':
          userQuery = userQuery.lt('last_active_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
          break;
        case 'newUsers':
          userQuery = userQuery.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          break;
        default: // 'all'
          break;
      }

      const { data: users, error: usersError } = await userQuery;
      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log('No users found for target audience:', targetAudience);
        return false;
      }

      const userIds = users.map(user => user.id);
      return await this.sendNotificationToUsers(userIds, notificationData);
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      return false;
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};
