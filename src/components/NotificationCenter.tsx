
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Bell, 
  Gift, 
  Trophy, 
  Users, 
  AlertCircle,
  CheckCircle,
  X,
  Settings
} from "lucide-react";

type NotificationType = "reward" | "achievement" | "referral" | "system" | "task";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reward",
    title: "Reward Earned!",
    message: "You've earned 50 points for completing the survey task",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false
  },
  {
    id: "2",
    type: "achievement",
    title: "New Achievement Unlocked!",
    message: "Congratulations! You've unlocked the 'Early Bird' badge",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false
  },
  {
    id: "3",
    type: "referral",
    title: "Referral Bonus",
    message: "Your friend Alex Johnson joined using your referral link! You earned 100 bonus points",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  },
  {
    id: "4",
    type: "system",
    title: "New Tasks Available",
    message: "3 new tasks have been added. Check them out to earn more rewards!",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  },
  {
    id: "5",
    type: "task",
    title: "Task Deadline Reminder",
    message: "The 'Share on Social Media' task expires in 2 hours",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true
  }
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "reward":
        return <Gift className="h-5 w-5 text-green-500" />;
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "referral":
        return <Users className="h-5 w-5 text-blue-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "task":
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success("Notification deleted");
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInDays}d ago`;
    }
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly show a toast notification
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const notificationTypes = ["New task available!", "Achievement unlocked!", "Referral bonus earned!"];
        const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        toast.success(randomNotification);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={filter === "reward" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("reward")}
            >
              Rewards
            </Button>
            <Button 
              variant={filter === "achievement" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("achievement")}
            >
              Achievements
            </Button>
            <Button 
              variant={filter === "referral" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("referral")}
            >
              Referrals
            </Button>
            <Button 
              variant={filter === "task" ? "default" : "outline"} 
              size="sm"
              onClick={() => setFilter("task")}
            >
              Tasks
            </Button>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-sm cursor-pointer ${
                    !notification.read 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' 
                      : 'bg-background'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredNotifications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
