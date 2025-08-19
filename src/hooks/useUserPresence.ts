import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Use refs to prevent re-subscription issues
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    if (!user || isSubscribedRef.current) return;

    const setupPresence = async () => {
      // Create unique channel name to avoid conflicts
      const uniqueChannelName = `presence_${channelName}_${user.id}_${Date.now()}`;
      const newChannel = supabase.channel(uniqueChannelName);
      channelRef.current = newChannel;
      isSubscribedRef.current = true;

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
        if (!channelRef.current) return;
        
        if (document.hidden) {
          channelRef.current.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatar: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString(),
            status: 'away'
          });
        } else {
          channelRef.current.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatar: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString(),
            status: 'online'
          });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Store cleanup function
      cleanupRef.current = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        isSubscribedRef.current = false;
      };
    };

    setupPresence();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [user?.id, channelName]); // Only depend on user.id and channelName

  const broadcastTyping = useCallback((typing: boolean) => {
    if (!user || !channelRef.current) return;

    setIsTyping(typing);
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        isTyping: typing
      }
    });
  }, [user?.id]);

  const updateStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    if (!user || !channelRef.current) return;

    channelRef.current.track({
      user_id: user.id,
      username: user.email?.split('@')[0] || 'Anonymous',
      avatar: user.user_metadata?.avatar_url,
      online_at: new Date().toISOString(),
      status
    });
  }, [user?.id]);

  const getTypingUsersExcludingSelf = useCallback(() => {
    return typingUsers.filter(t => t.userId !== user?.id);
  }, [typingUsers, user?.id]);

  return {
    onlineUsers: onlineUsers.filter(u => u.userId !== user?.id),
    typingUsers: getTypingUsersExcludingSelf(),
    isTyping,
    broadcastTyping,
    updateStatus,
    onlineCount: onlineUsers.length
  };
};