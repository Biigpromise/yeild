import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const BrandNotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Campaign Approved',
      message: 'Your "Summer Sale" campaign has been approved and is now live.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      title: 'Payment Successful',
      message: 'Payment of ₦15,000 for campaign funding was successful.',
      type: 'info',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '3',
      title: 'Campaign Rejected',
      message: 'Your "Winter Collection" campaign needs revision. Please check the feedback.',
      type: 'error',
      timestamp: '2 days ago',
      read: false,
    },
  ]);

  const [preferences, setPreferences] = useState({
    campaignUpdates: true,
    paymentAlerts: true,
    systemMessages: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">
            Stay updated with your campaigns and account activity
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Notification Preferences */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Campaign Updates</h4>
              <p className="text-sm text-muted-foreground">Get notified about campaign status changes</p>
            </div>
            <Switch
              checked={preferences.campaignUpdates}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, campaignUpdates: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Payment Alerts</h4>
              <p className="text-sm text-muted-foreground">Notifications for payments and billing</p>
            </div>
            <Switch
              checked={preferences.paymentAlerts}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, paymentAlerts: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">System Messages</h4>
              <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
            </div>
            <Switch
              checked={preferences.systemMessages}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, systemMessages: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Send notifications to your email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">SMS Notifications</h4>
              <p className="text-sm text-muted-foreground">Send urgent notifications via SMS</p>
            </div>
            <Switch
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, smsNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border border-border rounded-lg ${
                    notification.read ? 'bg-muted/30' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};