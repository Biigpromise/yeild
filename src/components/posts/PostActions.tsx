
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle } from "lucide-react";
import { Post } from '@/types/post';
import { EnhancedPostReactions } from './EnhancedPostReactions';

interface PostActionsProps {
  post: Post & { 
    likes_from_reactions?: number;
    dislikes_from_reactions?: number;
  };
  userId: string | null;
  onComment?: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, userId, onComment }) => {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
      <div className="flex items-center gap-1 hover:text-blue-500 transition-colors">
        <Eye className="h-4 w-4" />
        <span>{post.view_count || 0} views</span>
      </div>
      
      <EnhancedPostReactions postId={post.id} userId={userId} />
      
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
