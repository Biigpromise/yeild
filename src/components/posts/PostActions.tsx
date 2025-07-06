
import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle } from "lucide-react";
import { Post } from '@/types/post';
import { PostReactions } from './PostReactions';

interface PostActionsProps {
  post: Post & { 
    likes_from_reactions?: number;
    dislikes_from_reactions?: number;
  };
  userId: string | null;
  onLike: (post: Post) => void;
  onComment?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, userId, onLike, onComment }) => {
  const hasLiked = post.post_likes?.some(like => like.user_id === userId);

  console.log('PostActions rendering:', {
    postId: post.id,
    viewCount: post.view_count,
    likesCount: post.likes_count,
    hasLiked,
    userId,
    likes_from_reactions: post.likes_from_reactions,
    dislikes_from_reactions: post.dislikes_from_reactions
  });

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
      <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
        <Eye className="h-4 w-4" />
        <span>{post.view_count || 0} views</span>
      </div>
      
      <PostReactions postId={post.id} userId={userId} />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLike(post)}
        className={`p-0 h-auto hover:bg-transparent ${hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} transition-colors`}
      >
        <Heart className={`h-4 w-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
        <span>{post.likes_count || 0} likes</span>
      </Button>
      
      {onComment && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onComment}
          className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-blue-500 transition-colors"
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          <span>{post.reply_count || 0} comments</span>
        </Button>
      )}
    </div>
  );
};
