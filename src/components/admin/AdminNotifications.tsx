
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AdminNotification {
  id: string;
  type: string;
  message: string;
  link_to?: string;
  is_read: boolean;
  created_at: string;
}

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_brand_application':
      case 'new_campaign':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'campaign_approval_needed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${!notification.is_read ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getNotificationIcon(notification.type)}
                  <div>
                    <CardTitle className="text-lg">{notification.message}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      New
                    </Badge>
                  )}
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
};
