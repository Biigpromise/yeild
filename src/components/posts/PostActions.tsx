
import React from 'react';
import { ThumbsUp, Eye } from 'lucide-react';
import { Post } from '@/types/post';

interface PostActionsProps {
  post: Post;
  userId: string | null;
  handleLikePost: (post: Post) => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, userId, handleLikePost }) => {
  const hasLiked = post.post_likes?.some(like => like.user_id === userId);

  return (
    <div className="flex items-center gap-4 text-muted-foreground mt-3">
      <button
        onClick={() => handleLikePost(post)}
        disabled={!userId}
        className="flex items-center gap-1.5 group disabled:cursor-not-allowed"
        aria-label={`Like post by ${post.profile?.name ?? 'User'}`}
      >
        <ThumbsUp
          className={`h-4 w-4 group-hover:text-primary transition-colors ${hasLiked ? 'text-primary fill-primary' : ''}`}
        />
        <span className="text-sm">{post.likes_count ?? 0}</span>
      </button>
      <div className="flex items-center gap-1.5" title={`${post.view_count ?? 0} views`}>
        <Eye className="h-4 w-4" />
        <span className="text-sm">{post.view_count ?? 0}</span>
      </div>
    </div>
  );
};
