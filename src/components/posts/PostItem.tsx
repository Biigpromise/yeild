
import React, { useEffect, useRef, forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Post } from '@/types/post';
import { PostReplies } from './PostReplies';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
  post: Post & { media_url?: string };
  userId: string | null;
  onLike: (post: Post) => void;
  onView: (postId: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const PostItem = forwardRef<HTMLDivElement, PostItemProps>(({ post, userId, onLike, onView, onProfileClick }, ref) => {
  const hasBeenViewed = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenViewed.current) {
          hasBeenViewed.current = true;
          onView(post.id);
        }
      },
      { threshold: 0.5 }
    );

    if (ref && 'current' in ref && ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [post.id, onView, ref]);

  const hasLiked = post.post_likes?.some(like => like.user_id === userId);

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  const isImage = post.media_url && (post.media_url.includes('.jpg') || post.media_url.includes('.jpeg') || post.media_url.includes('.png') || post.media_url.includes('.gif') || post.media_url.includes('.webp'));
  const isVideo = post.media_url && (post.media_url.includes('.mp4') || post.media_url.includes('.webm') || post.media_url.includes('.mov'));

  return (
    <div 
      ref={ref} 
      data-post-id={post.id}
      className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <button
            onClick={handleProfileClick}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          >
            <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
              <AvatarImage src={post.profile?.profile_picture_url || undefined} />
              <AvatarFallback>{post.profile?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleProfileClick}
                className="font-semibold text-sm hover:underline focus:outline-none focus:underline truncate"
              >
                {post.profile?.name || 'Anonymous'}
              </button>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            
            {post.content && (
              <p className="text-sm mb-3 break-words leading-relaxed">{post.content}</p>
            )}
            
            {post.media_url && (
              <div className="mb-3">
                {isImage && (
                  <img
                    src={post.media_url}
                    alt="Post media"
                    className="max-w-full rounded-lg border"
                    loading="lazy"
                  />
                )}
                {isVideo && (
                  <video
                    src={post.media_url}
                    controls
                    className="max-w-full rounded-lg border"
                    preload="metadata"
                  />
                )}
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                <Eye className="h-4 w-4" />
                <span>{post.view_count}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post)}
                className={`p-0 h-auto hover:bg-transparent ${hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} transition-colors`}
              >
                <Heart className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{post.likes_count}</span>
              </Button>
            </div>

            <PostReplies 
              postId={post.id} 
              userId={userId} 
              replyCount={post.reply_count || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PostItem.displayName = 'PostItem';
