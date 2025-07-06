import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Post } from '@/types/post';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  reply_count: number;
  parent_comment_id: string | null;
  user: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  isLiked?: boolean;
  replies?: Comment[];
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  profile_picture_url?: string;
}

interface PostCommentsPageProps {
  post: Post & { media_url?: string };
  isOpen: boolean;
  onClose: () => void;
  onProfileClick?: (userId: string) => void;
}

export const PostCommentsPage: React.FC<PostCommentsPageProps> = ({ 
  post, 
  isOpen, 
  onClose, 
  onProfileClick 
}) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && post.id) {
      loadComments();
    }
  }, [isOpen, post.id]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserProfile({
          id: profile.id,
          name: profile.name || user.email?.split('@')[0] || 'User',
          email: user.email,
          profile_picture_url: profile.profile_picture_url
        });
      } else {
        setUserProfile({
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile({
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email
      });
    }
  };

  const loadComments = async () => {
    if (!post.id) return;
    
    setLoadingComments(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          reply_count,
          parent_comment_id,
          user:profiles!post_comments_user_id_fkey (
            id,
            name,
            profile_picture_url
          )
        `)
        .eq('post_id', post.id)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Load likes for current user
      let commentsWithLikes = commentsData || [];
      if (user) {
        const commentIds = commentsWithLikes.map(c => c.id);
        if (commentIds.length > 0) {
          const { data: likesData } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .in('comment_id', commentIds)
            .eq('user_id', user.id);

          const likedCommentIds = new Set(likesData?.map(l => l.comment_id) || []);
          commentsWithLikes = commentsWithLikes.map(comment => ({
            ...comment,
            isLiked: likedCommentIds.has(comment.id)
          }));
        }
      }

      // Load replies for comments that have them
      for (const comment of commentsWithLikes) {
        if (comment.reply_count > 0) {
          const { data: repliesData } = await supabase
            .from('post_comments')
            .select(`
              id,
              content,
              created_at,
              likes_count,
              reply_count,
              parent_comment_id,
              user:profiles!post_comments_user_id_fkey (
                id,
                name,
                profile_picture_url
              )
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true });

          (comment as any).replies = repliesData || [];
        }
      }

      setComments(commentsWithLikes);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          created_at,
          likes_count,
          reply_count,
          parent_comment_id,
          user:profiles!post_comments_user_id_fkey (
            id,
            name,
            profile_picture_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, { ...data, isLiked: false }]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: replyText.trim(),
          parent_comment_id: parentCommentId
        })
        .select(`
          id,
          content,
          created_at,
          likes_count,
          reply_count,
          parent_comment_id,
          user:profiles!post_comments_user_id_fkey (
            id,
            name,
            profile_picture_url
          )
        `)
        .single();

      if (error) throw error;

      // Update the parent comment's replies
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            reply_count: comment.reply_count + 1,
            replies: [...(comment.replies || []), { ...data, isLiked: false }]
          };
        }
        return comment;
      }));

      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply added!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isCurrentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (isCurrentlyLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .match({ comment_id: commentId, user_id: user.id });
      } else {
        await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
      }

      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !isCurrentlyLiked,
            likes_count: isCurrentlyLiked ? comment.likes_count - 1 : comment.likes_count + 1
          };
        }
        // Check replies too
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: !isCurrentlyLiked,
                likes_count: isCurrentlyLiked ? reply.likes_count - 1 : reply.likes_count + 1
              };
            }
            return reply;
          });
        }
        return comment;
      }));
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to update like');
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-2' : 'mb-4'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.profile_picture_url} />
        <AvatarFallback>
          {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-muted rounded-2xl px-3 py-2">
          <div className="font-semibold text-sm">{comment.user.name}</div>
          <div className="text-sm">{comment.content}</div>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          
          <button
            onClick={() => handleLikeComment(comment.id, comment.isLiked || false)}
            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
              comment.isLiked ? 'text-red-500' : ''
            }`}
          >
            <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
          </button>
          
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="hover:text-blue-500 transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-2 flex gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={userProfile?.profile_picture_url || ''} />
              <AvatarFallback>
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddReply(comment.id);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => handleAddReply(comment.id)}
                disabled={!replyText.trim() || loading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.map(reply => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  );

  const handleProfileClick = () => {
    if (onProfileClick && post.user_id) {
      onProfileClick(post.user_id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-semibold">Comments</DialogTitle>
        </DialogHeader>
        
        {/* Post content */}
        <div className="border-b pb-4">
          <PostHeader
            post={post}
            userId={user?.id || null}
            onProfileClick={handleProfileClick}
          />
          <PostContent
            content={post.content}
            mediaUrl={post.media_url}
          />
        </div>

        {/* Comments section */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingComments ? (
            <div className="text-center text-muted-foreground">Loading comments...</div>
          ) : (
            <>
              {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
              
              {comments.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </>
          )}
        </div>

        {/* Add comment input */}
        {user && userProfile && (
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.profile_picture_url || ''} />
                <AvatarFallback>
                  {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};