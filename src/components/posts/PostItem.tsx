
import React, { useRef, useEffect } from 'react';
import { Post } from '@/types/post';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostReplies } from './PostReplies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const hasViewed = useRef(false);

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  const handleDeletePost = async () => {
    if (!userId || post.user_id !== userId) return;
    
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Post deleted successfully');
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Handle view count only once per post
  useEffect(() => {
    if (!hasViewed.current && userId) {
      hasViewed.current = true;
      onView(post.id);
    }
  }, [post.id, onView, userId]);

  return (
    <div className="border-b border-border hover:bg-muted/30 transition-colors">
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <PostHeader
              post={post}
              userId={userId}
              onProfileClick={handleProfileClick}
              onDeletePost={handleDeletePost}
            />
            
            <PostContent
              content={post.content}
              mediaUrl={post.media_url}
            />
            
            <PostActions
              post={post}
              userId={userId}
              onLike={onLike}
            />

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
};
