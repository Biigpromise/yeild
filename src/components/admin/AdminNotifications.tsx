import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, UserCheck, History } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/admin/notificationService";
import { realAdminUserService } from "@/services/admin/realAdminUserService";

export const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [targetAudience, setTargetAudience] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await realAdminUserService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationData = await notificationService.getAllNotifications();
      setNotifications(notificationData);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    if (targetAudience === "specific" && selectedUsers.length === 0) {
      toast.error("Please select at least one user for specific targeting");
      return;
    }

    try {
      setSending(true);
      console.log('Sending notification with data:', {
        title,
        content,
        type,
        targetAudience,
        userIds: targetAudience === "specific" ? selectedUsers : undefined
      });

      const success = await notificationService.sendNotification({
        title,
        content,
        type,
        targetAudience,
        userIds: targetAudience === "specific" ? selectedUsers : undefined
      });

      if (success) {
        toast.success("Notification sent successfully!");
        
        // Reset form
        setTitle("");
        setContent("");
        setType("info");
        setTargetAudience("all");
        setSelectedUsers([]);
        
        // Reload notifications
        await loadNotifications();
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const getTypeColor = (notificationType: string) => {
    switch (notificationType) {
      case "success": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      case "info": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.is_read).length}
                </p>
                <p className="text-sm text-muted-foreground">Read Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send New Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter notification title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {targetAudience === "specific" && (
                    <div>
                      <Label>Select Users</Label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {users.map((user) => (
                          <label key={user.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                }
                              }}
                            />
                            <span className="text-sm">{user.name || user.email}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedUsers.length} user(s) selected
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">Notification Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter notification content"
                    rows={10}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setTitle("");
                  setContent("");
                  setType("info");
                  setTargetAudience("all");
                  setSelectedUsers([]);
                }}>
                  Clear
                </Button>
                <Button onClick={handleSendNotification} disabled={sending}>
                  {sending ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Notification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notifications sent yet
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {notification.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          {notification.is_read ? (
                            <Badge variant="outline">Read</Badge>
                          ) : (
                            <Badge variant="secondary">Unread</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sent: {new Date(notification.created_at).toLocaleString()}
                        {notification.profiles && (
                          <span className="ml-2">
                            To: {notification.profiles.name || notification.profiles.email}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
