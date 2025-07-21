import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  likes_count: number;
  reply_count: number;
  view_count: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

interface PostItemProps {
  post: Post;
  onPostUpdate: () => void;
}

export const PostItem: React.FC<PostItemProps> = ({ post, onPostUpdate }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count);
  const [hasViewed, setHasViewed] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      trackView();
    }
  }, [post.id, user]);

  const checkLikeStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();

      setLiked(!!data);
    } catch (error) {
      // No like found, which is fine
    }
  };

  const trackView = async () => {
    if (!user || hasViewed || post.user_id === user.id) return;

    try {
      await supabase.rpc('increment_post_view', {
        post_id_to_inc: post.id,
        user_id_param: user.id
      });
      setHasViewed(true);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      if (liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setLiked(false);
        setLocalLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        setLiked(true);
        setLocalLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.profiles.name}`,
        text: post.content,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const isOwnPost = user?.id === post.user_id;

  return (
    <Card className="p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles.profile_picture_url} />
            <AvatarFallback>
              {post.profiles.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.profiles.name || 'Anonymous'}</span>
              {isOwnPost && <Badge variant="secondary" className="text-xs">You</Badge>}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
        
        {post.media_url && (
          <div className="rounded-lg overflow-hidden border">
            {post.media_url.includes('.mp4') || post.media_url.includes('.webm') ? (
              <video 
                src={post.media_url} 
                className="w-full max-h-96 object-cover"
                controls
              />
            ) : (
              <img 
                src={post.media_url} 
                alt="Post media"
                className="w-full max-h-96 object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current text-red-500' : ''}`} />
            {localLikesCount}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.reply_count}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Eye className="h-3 w-3 mr-1" />
          {post.view_count}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground text-center">
            Comments feature coming soon...
          </div>
        </div>
      )}
    </Card>
  );
};