
import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Eye, MessageCircle, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import { Post } from '@/types/post';
import { PostReplies } from './PostReplies';
import { formatDistanceToNow } from 'date-fns';
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
  const hasLiked = post.post_likes?.some(like => like.user_id === userId);
  const hasViewed = useRef(false);
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

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

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!userId) return;

    try {
      if (userReaction === reactionType) {
        // Remove existing reaction using the RPC function
        const { error } = await supabase.rpc('delete_post_reaction', {
          p_post_id: post.id,
          p_user_id: userId
        });
        
        if (error) throw error;
        setUserReaction(null);
      } else {
        // Add or update reaction using the RPC function
        const { error } = await supabase.rpc('upsert_post_reaction', {
          p_post_id: post.id,
          p_user_id: userId,
          p_reaction_type: reactionType
        });
        
        if (error) throw error;
        setUserReaction(reactionType);
      }
      
      // Refresh reactions count
      loadReactions();
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction_type, user_id')
        .eq('post_id', post.id);

      if (error) {
        console.error('Error loading reactions:', error);
        return;
      }

      const likes = data?.filter(r => r.reaction_type === 'like').length || 0;
      const dislikes = data?.filter(r => r.reaction_type === 'dislike').length || 0;
      
      setReactions({ likes, dislikes });
      
      if (userId) {
        const userReactionData = data?.find(r => r.user_id === userId);
        setUserReaction(userReactionData?.reaction_type as 'like' | 'dislike' || null);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  useEffect(() => {
    loadReactions();
  }, [post.id, userId]);

  const isImage = post.media_url && (post.media_url.includes('.jpg') || post.media_url.includes('.jpeg') || post.media_url.includes('.png') || post.media_url.includes('.gif') || post.media_url.includes('.webp'));
  const isVideo = post.media_url && (post.media_url.includes('.mp4') || post.media_url.includes('.webm') || post.media_url.includes('.mov'));

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
          <button
            onClick={handleProfileClick}
            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
          >
            <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
              <AvatarImage src={post.profiles?.profile_picture_url || undefined} />
              <AvatarFallback>{post.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleProfileClick}
                  className="font-semibold text-sm hover:underline focus:outline-none focus:underline truncate"
                >
                  {post.profiles?.name || 'User'}
                </button>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              
              {userId === post.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeletePost}
                  className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
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
                onClick={() => handleReaction('like')}
                className={`p-0 h-auto hover:bg-transparent ${userReaction === 'like' ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'} transition-colors`}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                <span>{reactions.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('dislike')}
                className={`p-0 h-auto hover:bg-transparent ${userReaction === 'dislike' ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'} transition-colors`}
              >
                <ThumbsDown className={`h-4 w-4 mr-1 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                <span>{reactions.dislikes}</span>
              </Button>
              
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
};
