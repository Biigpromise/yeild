
import React, { useEffect, useRef, forwardRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Post } from '@/types/post';
import { PostReplies } from './PostReplies';
import { formatDistanceToNow } from 'date-fns';

interface PostItemProps {
  post: Post;
  userId: string | null;
  onLike: (post: Post) => void;
  onView: (postId: string) => void;
}

export const PostItem = forwardRef<HTMLDivElement, PostItemProps>(({ post, userId, onLike, onView }, ref) => {
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

  return (
    <Card ref={ref} className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profile?.profile_picture_url || undefined} />
            <AvatarFallback>{post.profile?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{post.profile?.name || 'Anonymous'}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm mb-3 break-words">{post.content}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.view_count}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post)}
            className={`p-0 h-auto ${hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
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
      </CardContent>
    </Card>
  );
});

PostItem.displayName = 'PostItem';
