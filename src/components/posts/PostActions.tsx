
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
import { Post } from '@/types/post';
import { PostReactions } from './PostReactions';

interface PostActionsProps {
  post: Post;
  userId: string | null;
  onLike: (post: Post) => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, userId, onLike }) => {
  const hasLiked = post.post_likes?.some(like => like.user_id === userId);

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
      <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
        <Eye className="h-4 w-4" />
        <span>{post.view_count}</span>
      </div>
      
      <PostReactions postId={post.id} userId={userId} />
      
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
  );
};
