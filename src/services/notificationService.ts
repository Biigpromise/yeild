
import { supabase } from "@/integrations/supabase/client";

export interface NotificationData {
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'achievement';
  userId: string;
}

export const notificationService = {
  // Send notification to user
  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-user-notification', {
        body: {
          userId: data.userId,
          title: data.title,
          content: data.content,
          type: data.type
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  },

  // Send task completion notification
  async sendTaskCompletionNotification(userId: string, taskTitle: string, pointsEarned: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Task Completed!',
      content: `You completed "${taskTitle}" and earned ${pointsEarned} points!`,
      type: 'success'
    });
  },

  // Send achievement notification
  async sendAchievementNotification(userId: string, achievementName: string, pointsEarned: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Achievement Unlocked!',
      content: `You unlocked "${achievementName}" and earned ${pointsEarned} points!`,
      type: 'achievement'
    });
  },

  // Send level up notification
  async sendLevelUpNotification(userId: string, newLevel: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Level Up!',
      content: `Congratulations! You've reached level ${newLevel}!`,
      type: 'achievement'
    });
  },

  // Send task rejection notification
  async sendTaskRejectionNotification(userId: string, taskTitle: string, reason: string): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: 'Task Submission Rejected',
      content: `Your submission for "${taskTitle}" was rejected. Reason: ${reason}`,
      type: 'warning'
    });
  }
};
