
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
      title: '🎉 Task Completed!',
      content: `You completed "${taskTitle}" and earned ${pointsEarned} points!`,
      type: 'success'
    });
  },

  // Send achievement notification
  async sendAchievementNotification(userId: string, achievementName: string, pointsEarned: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: '🏆 Achievement Unlocked!',
      content: `You unlocked "${achievementName}" and earned ${pointsEarned} points!`,
      type: 'achievement'
    });
  },

  // Send level up notification
  async sendLevelUpNotification(userId: string, newLevel: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: '⭐ Level Up!',
      content: `Congratulations! You've reached level ${newLevel}!`,
      type: 'achievement'
    });
  },

  // Task approval notification
  async sendTaskApprovalNotification(userId: string, taskTitle: string, pointsEarned: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: '✅ Task Approved!',
      content: `Your submission for "${taskTitle}" was approved! You earned ${pointsEarned} points.`,
      type: 'success'
    });
  },

  // Task rejection - DO NOT send notification (as per user request)
  // Users should see decline reasons in the task interface instead
  async logTaskRejection(userId: string, taskTitle: string, reason: string): Promise<boolean> {
    console.log(`Task "${taskTitle}" declined for user ${userId}. Reason: ${reason}`);
    console.log('No notification sent - user will see decline reason in task interface');
    
    // Log the rejection for admin/debugging purposes but don't notify the user
    try {
      await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          points: 0,
          transaction_type: 'task_declined',
          description: `Task "${taskTitle}" declined: ${reason}`,
          reference_id: crypto.randomUUID()
        });
    } catch (error) {
      console.error('Error logging task rejection:', error);
    }
    
    return true;
  },

  // Task resubmission notification for admins
  async notifyAdminOfResubmission(userId: string, taskTitle: string, submissionId: string): Promise<boolean> {
    console.log(`Task "${taskTitle}" resubmitted by user ${userId}. Submission ID: ${submissionId}`);
    
    // This could trigger an admin notification if needed
    try {
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'task_resubmission',
          message: `Task "${taskTitle}" was resubmitted for review`,
          link_to: `/admin/submissions/${submissionId}`
        });
      
      return true;
    } catch (error) {
      console.error('Error notifying admin of resubmission:', error);
      return false;
    }
  },

  // Referral activation notification
  async sendReferralActivationNotification(userId: string, referredUserName: string, pointsEarned: number): Promise<boolean> {
    return this.sendNotification({
      userId,
      title: '🎯 Referral Activated!',
      content: `${referredUserName} has become active! You earned ${pointsEarned} bonus points.`,
      type: 'success'
    });
  }
};
