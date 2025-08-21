import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, X, Zap, Trophy, Users, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'achievement' | 'referral' | 'system';
  read: boolean;
  created_at: string;
}

interface LiveNotificationsProps {
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

export const LiveNotifications: React.FC<LiveNotificationsProps> = ({
  unreadCount,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Load notifications
  useEffect(() => {
    if (user && open) {
      loadNotifications();
    }
  }, [user, open]);

  // Real-time updates
  useEffect(() => {
    if (user) {
      // Set up real-time subscription for new notifications
      const interval = setInterval(() => {
        // Simulate real-time updates
        const newCount = Math.floor(Math.random() * 5);
        onUnreadCountChange(newCount);
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, onUnreadCountChange]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, use mock data since we don't have notifications table yet
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Task Completed!',
          message: 'You earned 50 points for completing "Social Media Share"',
          type: 'task',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'New Achievement Unlocked!',
          message: 'Congratulations! You reached Level 2',
          type: 'achievement',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          title: 'Referral Bonus',
          message: 'Your friend joined using your referral code. +25 points!',
          type: 'referral',
          read: true,
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      const unread = mockNotifications.filter(n => !n.read).length;
      onUnreadCountChange(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    const newUnreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length;
    onUnreadCountChange(newUnreadCount);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onUnreadCountChange(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return Zap;
      case 'achievement': return Trophy;
      case 'referral': return Users;
      case 'system': return Gift;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-primary';
      case 'achievement': return 'text-yellow-600';
      case 'referral': return 'text-blue-600';
      case 'system': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.some(n => !n.read) && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center ${
                          !notification.read ? 'border-primary' : 'border-border'
                        }`}>
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-1">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-4">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};