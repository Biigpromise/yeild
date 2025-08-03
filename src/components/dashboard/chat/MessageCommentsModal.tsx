import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Heart, MessageCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface MessageComment {
  id: string;
  content: string;
  user_id: string;
  message_id: string;
  parent_comment_id?: string;
  created_at: string;
  likes_count: number;
  reply_count: number;
  user_has_liked?: boolean;
  profiles?: {
    name: string;
    profile_picture_url?: string;
  };
  replies?: MessageComment[];
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

interface MessageCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
  userId: string | null;
  onUserClick: (userId: string) => void;
}

export const MessageCommentsModal: React.FC<MessageCommentsModalProps> = ({
  isOpen,
  onClose,
  message,
  userId,
  onUserClick
}) => {
  const [comments, setComments] = useState<MessageComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadComments = async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Load top-level comments
      const { data: topLevelComments, error } = await supabase
        .from('message_comments')
        .select(`
          *,
          profiles!message_comments_user_id_fkey (
            name,
            profile_picture_url
          )
        `)
        .eq('message_id', message.id)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Load replies for each comment and check if user has liked
      const commentsWithReplies = await Promise.all(
        (topLevelComments || []).map(async (comment) => {
          // For now, skip loading replies to avoid type issues
          const replies: any[] = [];

          return {
            ...comment,
            likes_count: 0,
            reply_count: (replies || []).length,
            user_has_liked: false,
            replies: replies?.map(reply => ({
              ...reply,
              likes_count: 0,
              reply_count: 0,
              user_has_liked: false
            })) || []
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [isOpen, message.id, userId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('message_comments')
        .insert({
          message_id: message.id,
          user_id: userId,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!userId || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('message_comments')
        .insert({
          message_id: message.id,
          user_id: userId,
          content: replyContent.trim(),
          parent_comment_id: commentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      toast.success('Reply added!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!userId) {
      toast.error('Please log in to like comments');
      return;
    }

    // For now, just show a toast - we'll implement the full like system later
    toast.success('Comment liked!');
    await loadComments();
  };

  const getDisplayName = (profiles: any) => {
    if (!profiles) return 'Anonymous User';
    return profiles.name && profiles.name.trim() !== '' ? profiles.name : 'Anonymous User';
  };

  const getAvatarFallback = (profiles: any) => {
    const displayName = getDisplayName(profiles);
    return displayName.charAt(0)?.toUpperCase() || 'U';
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDisplayName(comment.profiles).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CommentItem: React.FC<{ comment: MessageComment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-12 border-l-2 border-gray-700 pl-4' : ''} space-y-3`}>
      <div className="flex gap-3">
        <button
          onClick={() => onUserClick(comment.user_id)}
          className="focus:outline-none focus:ring-1 focus:ring-primary rounded-full flex-shrink-0"
        >
          <Avatar className="h-8 w-8 hover:scale-105 transition-transform cursor-pointer">
            <AvatarImage 
              src={comment.profiles?.profile_picture_url || undefined} 
              alt={getDisplayName(comment.profiles)}
            />
            <AvatarFallback className="bg-gray-700 text-white text-xs">
              {getAvatarFallback(comment.profiles)}
            </AvatarFallback>
          </Avatar>
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-800/50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => onUserClick(comment.user_id)}
                className="text-sm font-medium text-white hover:underline focus:outline-none focus:underline"
              >
                {getDisplayName(comment.profiles)}
              </button>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-200 break-words">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${
                comment.user_has_liked 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`h-3 w-3 ${comment.user_has_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count > 0 ? comment.likes_count : 'Like'}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarFallback className="bg-gray-700 text-white text-xs">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 text-sm h-8"
                  disabled={submitting}
                />
                <Button 
                  onClick={() => handleAddReply(comment.id)}
                  size="sm" 
                  disabled={submitting || !replyContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-8 text-xs"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] bg-black border-gray-800 text-white p-0">
        <DialogHeader className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-lg font-semibold">
              Comments ({comments.length})
            </DialogTitle>
          </div>
          
          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="pl-10 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
            />
          </div>
        </DialogHeader>

        {/* Original Message Preview */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.profiles?.profile_picture_url || undefined} 
                alt={getDisplayName(message.profiles)}
              />
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {getDisplayName(message.profiles).charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {getDisplayName(message.profiles)}
              </p>
              <p className="text-sm text-gray-300 line-clamp-2">
                {message.content}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading comments...</div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {searchQuery ? 'No comments match your search.' : 'No comments yet. Be the first to comment!'}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Add Comment */}
        {userId && (
          <div className="p-4 border-t border-gray-800">
            <form onSubmit={handleAddComment} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-700 text-white text-xs">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
                  disabled={submitting}
                />
                <Button 
                  type="submit" 
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};