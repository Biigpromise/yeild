
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Send, Users, AlertCircle, Info, CheckCircle } from "lucide-react";

interface NotificationForm {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'users' | 'brands' | 'admins';
}

export const AdminNotifications = () => {
  const [formData, setFormData] = useState<NotificationForm>({
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all'
  });

  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: NotificationForm) => {
      // Create announcement first
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: notificationData.title,
          content: notificationData.content,
          type: notificationData.type,
          target_audience: notificationData.target_audience,
          is_active: true
        })
        .select()
        .single();

      if (announcementError) throw announcementError;

      // Get target users based on audience
      let targetUsers = [];
      if (notificationData.target_audience === 'all') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id');
        targetUsers = users || [];
      } else {
        const { data: users } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', notificationData.target_audience === 'users' ? 'user' : notificationData.target_audience);
        targetUsers = users?.map(u => ({ id: u.user_id })) || [];
      }

      // Create individual notifications
      const notifications = targetUsers.map(user => ({
        user_id: user.id,
        title: notificationData.title,
        content: notificationData.content,
        type: notificationData.type,
        announcement_id: announcement.id
      }));

      if (notifications.length > 0) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) throw notificationError;
      }

      return { announcement, notificationsCount: notifications.length };
    },
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.notificationsCount} users`);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        target_audience: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error: any) => {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    sendNotificationMutation.mutate(formData);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications Management</h2>
        <p className="text-muted-foreground">Send platform-wide notifications and manage user communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send New Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Message *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select 
                    value={formData.target_audience} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="users">Regular Users</SelectItem>
                      <SelectItem value="brands">Brands</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={sendNotificationMutation.isPending}
              >
                {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{notifications?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Read Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
