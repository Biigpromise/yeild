import React, { useState } from 'react';
import { Post } from '@/types/post';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';

interface PostItemProps {
  post: Post & { media_url?: string };
  userId: string | null;
  onLike: (post: Post) => void;
  onView: (postId: string) => void;
  onProfileClick?: (userId: string) => void;
  onPostDeleted?: () => void;
}

export const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userId, 
  onLike, 
  onView, 
  onProfileClick,
  onPostDeleted 
}) => {
  const [showComments, setShowComments] = useState(false);

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
    if (!showComments) {
      onView(post.id);
    }
  };

  return (
    <div className="border-b border-border hover:bg-muted/30 transition-colors">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <PostHeader
              post={post}
              userId={userId}
              onProfileClick={handleProfileClick}
              onDeletePost={onPostDeleted}
            />
            
            <PostContent
              content={post.content}
              mediaUrl={post.media_url}
            />
            
            <PostActions
              post={post}
              userId={userId}
              onLike={onLike}
              onComment={handleCommentToggle}
            />

            <PostComments 
              postId={post.id} 
              isVisible={showComments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};