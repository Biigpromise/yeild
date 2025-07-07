import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Post } from '@/types/post';

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
    <div className={`flex gap-3 ${isReply ? 'ml-8 mt-3 border-l-2 border-muted pl-4' : 'pb-4'}`}>
      <Avatar className="h-9 w-9 mt-1">
        <AvatarImage src={comment.user.profile_picture_url} />
        <AvatarFallback className="text-xs">
          {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-2xl px-4 py-3 hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 ml-2">
          <button
            onClick={() => handleLikeComment(comment.id, comment.isLiked || false)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all hover:bg-red-50 dark:hover:bg-red-950/30 ${
              comment.isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-950/30' 
                : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likes_count > 0 ? comment.likes_count : 'Like'}</span>
          </button>
          
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="px-2 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
            >
              {replyingTo === comment.id ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-3 ml-2 animate-fade-in">
            <div className="flex gap-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={userProfile?.profile_picture_url || ''} />
                <AvatarFallback className="text-xs">
                  {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.user.name}...`}
                  className="min-h-[40px] max-h-24 resize-none text-sm border-2 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddReply(comment.id);
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleAddReply(comment.id)}
                  disabled={!replyText.trim() || loading}
                  className="h-9"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
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
      <DialogContent 
        className="fixed inset-0 z-[9999] max-w-none max-h-none w-screen h-screen overflow-hidden flex flex-col p-0 gap-0 m-0 translate-x-0 translate-y-0 rounded-none border-0 bg-background data-[state=open]:slide-in-from-bottom-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Clean Header with Back Button */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-lg font-semibold">Comments</DialogTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>

        {/* Minimal Post Context */}
        <div className="px-4 py-3 border-b bg-muted/20">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8" onClick={handleProfileClick}>
              <AvatarImage src={post.profiles?.profile_picture_url} />
              <AvatarFallback>
                {post.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span 
                  className="font-medium hover:underline cursor-pointer"
                  onClick={handleProfileClick}
                >
                  {post.profiles?.name || 'Anonymous'}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1">
                <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
                {post.media_url && (
                  <div className="mt-2">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="max-w-sm rounded-lg object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Full Focus */}
        <div className="flex-1 overflow-y-auto">
          {loadingComments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading comments...</div>
            </div>
          ) : (
            <div className="px-4 py-2">
              {comments.map((comment, index) => (
                <div key={comment.id} className={index > 0 ? 'mt-4' : ''}>
                  <CommentItem comment={comment} />
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-2">No comments yet</div>
                  <div className="text-sm text-muted-foreground">
                    Start the conversation by adding the first comment!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Comment Input */}
        {user && userProfile && (
          <div className="border-t bg-background/95 backdrop-blur-sm p-4 sticky bottom-0">
            <div className="flex gap-3 items-start">
              <Avatar className="h-9 w-9 mt-1">
                <AvatarImage src={userProfile.profile_picture_url || ''} />
                <AvatarFallback className="text-xs">
                  {userProfile.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex gap-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[44px] max-h-32 resize-none border-2 focus:border-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || loading}
                  className="h-11 px-4 animate-fade-in"
                  size="sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};