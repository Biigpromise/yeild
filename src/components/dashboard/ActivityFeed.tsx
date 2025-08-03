import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Trophy, 
  Users, 
  MessageSquare, 
  Gift,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ActivityItem {
  id: string;
  type: 'task_completion' | 'achievement' | 'new_follower' | 'message' | 'reward' | 'referral';
  title: string;
  description: string;
  timestamp: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

export const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivities();
      setupRealTimeUpdates();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;

    try {
      // Get recent task completions with user info
      const { data: taskSubmissions } = await supabase
        .from('task_submissions')
        .select(`
          id,
          created_at,
          status,
          task_id,
          user_id,
          tasks(title)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user profiles for task submissions
      const userIds = taskSubmissions?.map(s => s.user_id) || [];
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .in('id', userIds);

      // Get recent messages with user info
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id,
          created_at,
          content,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user profiles for messages
      const messageUserIds = messages?.map(m => m.user_id) || [];
      const { data: messageProfiles } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .in('id', messageUserIds);

      // Get recent user registrations
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const activityItems: ActivityItem[] = [];

      // Add task completions
      taskSubmissions?.forEach(submission => {
        const userProfile = userProfiles?.find(p => p.id === submission.user_id);
        if (userProfile && submission.tasks) {
          activityItems.push({
            id: `task-${submission.id}`,
            type: 'task_completion',
            title: 'Task Completed',
            description: `${userProfile.name} completed "${submission.tasks.title}"`,
            timestamp: new Date(submission.created_at),
            user: {
              id: submission.user_id,
              name: userProfile.name,
              avatar: userProfile.profile_picture_url
            }
          });
        }
      });

      // Add messages
      messages?.forEach(message => {
        const userProfile = messageProfiles?.find(p => p.id === message.user_id);
        if (userProfile) {
          activityItems.push({
            id: `message-${message.id}`,
            type: 'message',
            title: 'New Message',
            description: `${userProfile.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            timestamp: new Date(message.created_at),
            user: {
              id: message.user_id,
              name: userProfile.name,
              avatar: userProfile.profile_picture_url
            }
          });
        }
      });

      // Add new users
      newUsers?.forEach(newUser => {
        if (newUser.name) {
          activityItems.push({
            id: `user-${newUser.id}`,
            type: 'new_follower',
            title: 'New Member',
            description: `${newUser.name} joined the platform`,
            timestamp: new Date(newUser.created_at),
            user: {
              id: newUser.id,
              name: newUser.name,
              avatar: newUser.profile_picture_url
            }
          });
        }
      });

      // Sort by timestamp
      activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setActivities(activityItems.slice(0, 10));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel('activity-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_submissions'
        },
        () => loadActivities()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => loadActivities()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => loadActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completion':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'new_follower':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'reward':
        return <Gift className="h-4 w-4 text-red-500" />;
      case 'referral':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};