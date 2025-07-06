import React, { useState } from 'react';
import { Post } from '@/types/post';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostCommentsPage } from './PostCommentsPage';

interface PostItemProps {
  post: Post & { media_url?: string };
  userId: string | null;
  onView: (postId: string) => void;
  onProfileClick?: (userId: string) => void;
  onPostDeleted?: () => void;
}

export const PostItem: React.FC<PostItemProps> = ({ 
  post, 
  userId, 
  onView, 
  onProfileClick,
  onPostDeleted 
}) => {
  const [showCommentsPage, setShowCommentsPage] = useState(false);

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  const handleCommentToggle = () => {
    setShowCommentsPage(true);
    onView(post.id);
  };

  const handleCloseComments = () => {
    setShowCommentsPage(false);
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
              onComment={handleCommentToggle}
            />

            <PostCommentsPage
              post={post}
              isOpen={showCommentsPage}
              onClose={handleCloseComments}
              onProfileClick={onProfileClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};