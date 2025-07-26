
import { supabase } from "@/integrations/supabase/client";

export interface EmailDeliveryLog {
  id?: string;
  email: string;
  email_type: 'password_reset' | 'verification' | 'brand_confirmation' | 'notification';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  delivery_time_seconds?: number;
}

export class EmailMonitoringService {
  static async logEmailSent(email: string, emailType: EmailDeliveryLog['email_type']) {
    try {
      const { data, error } = await supabase
        .from('email_delivery_logs')
        .insert({
          email,
          email_type: emailType,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to log email sent:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging email sent:', error);
      return null;
    }
  }

  static async updateEmailStatus(
    logId: string, 
    status: EmailDeliveryLog['status'], 
    errorMessage?: string
  ) {
    try {
      const updateData: any = {
        status,
        [`${status}_at`]: new Date().toISOString()
      };

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      // Calculate delivery time if status is delivered
      if (status === 'delivered') {
        const { data: logData } = await supabase
          .from('email_delivery_logs')
          .select('sent_at')
          .eq('id', logId)
          .single();

        if (logData?.sent_at) {
          const sentTime = new Date(logData.sent_at);
          const deliveredTime = new Date();
          const deliveryTimeSeconds = Math.round((deliveredTime.getTime() - sentTime.getTime()) / 1000);
          updateData.delivery_time_seconds = deliveryTimeSeconds;
        }
      }

      const { error } = await supabase
        .from('email_delivery_logs')
        .update(updateData)
        .eq('id', logId);

      if (error) {
        console.error('Failed to update email status:', error);
      }
    } catch (error) {
      console.error('Error updating email status:', error);
    }
  }

  static async getEmailStats(timeRange: 'hour' | 'day' | 'week' = 'day') {
    try {
      let timeFilter = '';
      const now = new Date();
      
      switch (timeRange) {
        case 'hour':
          timeFilter = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
          break;
        case 'day':
          timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'week':
          timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }

      const { data, error } = await supabase
        .from('email_delivery_logs')
        .select('*')
        .gte('sent_at', timeFilter);

      if (error) {
        console.error('Failed to get email stats:', error);
        return null;
      }

      const stats = {
        total: data.length,
        sent: data.filter(log => log.status === 'sent').length,
        delivered: data.filter(log => log.status === 'delivered').length,
        failed: data.filter(log => log.status === 'failed').length,
        averageDeliveryTime: 0
      };

      const deliveredEmails = data.filter(log => log.delivery_time_seconds);
      if (deliveredEmails.length > 0) {
        stats.averageDeliveryTime = Math.round(
          deliveredEmails.reduce((sum, log) => sum + (log.delivery_time_seconds || 0), 0) / deliveredEmails.length
        );
      }

      return stats;
    } catch (error) {
      console.error('Error getting email stats:', error);
      return null;
    }
  }
}
