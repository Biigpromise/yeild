import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  onView: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, currentUserId, onView }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [reactionsCount, setReactionsCount] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    checkLikeStatus();
    fetchCounts();
    
    // Track view when message comes into view
    if (!hasViewed && message.user_id !== currentUserId) {
      onView();
      setHasViewed(true);
    }
  }, [message.id]);

  const checkLikeStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('message_likes')
        .select('id')
        .eq('message_id', message.id)
        .eq('user_id', user.id)
        .single();

      setLiked(!!data);
    } catch (error) {
      // No like found, which is fine
    }
  };

  const fetchCounts = async () => {
    try {
      const [likesResponse, reactionsResponse] = await Promise.all([
        supabase
          .from('message_likes')
          .select('id', { count: 'exact' })
          .eq('message_id', message.id),
        supabase
          .from('message_reactions')
          .select('id', { count: 'exact' })
          .eq('message_id', message.id)
      ]);

      setLikesCount(likesResponse.count || 0);
      setReactionsCount(reactionsResponse.count || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (liked) {
        await supabase
          .from('message_likes')
          .delete()
          .eq('message_id', message.id)
          .eq('user_id', user.id);
        
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('message_likes')
          .insert({
            message_id: message.id,
            user_id: user.id
          });
        
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_reactions')
        .insert({
          message_id: message.id,
          user_id: user.id,
          emoji
        });
      
      setReactionsCount(prev => prev + 1);
      toast.success(`Reacted with ${emoji}`);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const isOwnMessage = message.user_id === currentUserId;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.profiles.profile_picture_url} />
        <AvatarFallback>
          {message.profiles.name?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium">{message.profiles.name || 'Anonymous'}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className={`rounded-lg p-3 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {message.media_url && (
            <div className="mt-2">
              <img 
                src={message.media_url} 
                alt="Message attachment"
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${
          isOwnMessage ? 'flex-row-reverse' : ''
        }`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={handleLike}
          >
            <Heart className={`h-3 w-3 mr-1 ${liked ? 'fill-current text-red-500' : ''}`} />
            {likesCount}
          </Button>

          <div className="flex items-center gap-1">
            {['👍', '😄', '❤️', '🎉'].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>

          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            {message.views_count}
          </div>
        </div>
      </div>
    </div>
  );
};