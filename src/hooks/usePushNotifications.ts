import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | 'default';
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'default'
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window;
    const permission = isSupported ? Notification.permission : 'default';
    const isEnabled = permission === 'granted';
    
    setState({
      isSupported,
      isEnabled,
      permission
    });
  }, []);

  // Request permission for push notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted'
      }));

      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
        // Store preference
        if (user?.id) {
          localStorage.setItem(`push_enabled_${user.id}`, 'true');
        }
        return true;
      } else if (permission === 'denied') {
        toast.error('Push notifications were denied. You can enable them in browser settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  }, [state.isSupported, user?.id]);

  // Disable push notifications
  const disableNotifications = useCallback(() => {
    if (user?.id) {
      localStorage.removeItem(`push_enabled_${user.id}`);
    }
    setState(prev => ({
      ...prev,
      isEnabled: false
    }));
    toast.info('Push notifications disabled');
  }, [user?.id]);

  // Send a local notification
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!state.isEnabled) return;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [state.isEnabled]);

  // Notify about new task
  const notifyNewTask = useCallback((taskTitle: string, points: number) => {
    sendNotification('🎯 New Task Available!', {
      body: `"${taskTitle}" - Earn ${points} points`,
      tag: 'new-task'
    });
  }, [sendNotification]);

  // Notify about referral activity
  const notifyReferral = useCallback((referralName: string, action: string) => {
    sendNotification('👥 Referral Activity', {
      body: `${referralName} ${action}`,
      tag: 'referral'
    });
  }, [sendNotification]);

  // Notify about withdrawal status
  const notifyWithdrawal = useCallback((status: 'approved' | 'completed' | 'rejected', amount: number) => {
    const messages = {
      approved: `Your withdrawal of ₦${amount.toLocaleString()} has been approved!`,
      completed: `₦${amount.toLocaleString()} has been sent to your account!`,
      rejected: `Your withdrawal request was declined. Please contact support.`
    };
    
    sendNotification(status === 'rejected' ? '⚠️ Withdrawal Update' : '💰 Withdrawal Update', {
      body: messages[status],
      tag: 'withdrawal'
    });
  }, [sendNotification]);

  // Notify about daily bonus
  const notifyDailyBonus = useCallback(() => {
    sendNotification('🎁 Daily Bonus Ready!', {
      body: 'Claim your daily login bonus now!',
      tag: 'daily-bonus'
    });
  }, [sendNotification]);

  return {
    ...state,
    requestPermission,
    disableNotifications,
    sendNotification,
    notifyNewTask,
    notifyReferral,
    notifyWithdrawal,
    notifyDailyBonus
  };
};
