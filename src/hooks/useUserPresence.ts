import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPresence {
  userId: string;
  username: string;
  avatar?: string;
  onlineAt: string;
  status: 'online' | 'away' | 'offline';
}

export interface TypingStatus {
  userId: string;
  username: string;
  isTyping: boolean;
}

export const useUserPresence = (channelName: string = 'general') => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user || isSubscribed) return;

    // Create unique channel name to avoid conflicts
    const uniqueChannelName = `presence_${channelName}_${Date.now()}`;
    const newChannel = supabase.channel(uniqueChannelName);
    setChannel(newChannel);
    setIsSubscribed(true);

    // Subscribe to presence changes
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          presences.forEach(presence => {
            users.push({
              userId: presence.user_id,
              username: presence.username,
              avatar: presence.avatar,
              onlineAt: presence.online_at,
              status: presence.status || 'online'
            });
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(t => t.userId !== payload.userId);
          if (payload.isTyping) {
            return [...filtered, {
              userId: payload.userId,
              username: payload.username,
              isTyping: true
            }];
          }
          return filtered;
        });

        // Auto-remove typing status after 3 seconds
        if (payload.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(t => t.userId !== payload.userId));
          }, 3000);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          await newChannel.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatar: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString(),
            status: 'online'
          });
        }
      });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        newChannel.track({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          avatar: user.user_metadata?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'away'
        });
      } else {
        newChannel.track({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'Anonymous',
          avatar: user.user_metadata?.avatar_url,
          online_at: new Date().toISOString(),
          status: 'online'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(newChannel);
      setChannel(null);
      setIsSubscribed(false);
    };
  }, [user, channelName, isSubscribed]);

  const broadcastTyping = useCallback((typing: boolean) => {
    if (!user || !channel) return;

    setIsTyping(typing);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        isTyping: typing
      }
    });
  }, [user, channel]);

  const updateStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    if (!user || !channel) return;

    channel.track({
      user_id: user.id,
      username: user.email?.split('@')[0] || 'Anonymous',
      avatar: user.user_metadata?.avatar_url,
      online_at: new Date().toISOString(),
      status
    });
  }, [user, channel]);

  const getTypingUsersExcludingSelf = () => {
    return typingUsers.filter(t => t.userId !== user?.id);
  };

  return {
    onlineUsers: onlineUsers.filter(u => u.userId !== user?.id),
    typingUsers: getTypingUsersExcludingSelf(),
    isTyping,
    broadcastTyping,
    updateStatus,
    onlineCount: onlineUsers.length
  };
};