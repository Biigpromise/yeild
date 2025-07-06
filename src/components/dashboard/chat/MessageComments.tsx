import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface MessageComment {
  id: string;
  content: string;
  user_id: string;
  message_id: string;
  created_at: string;
  profiles?: {
    name: string;
    profile_picture_url?: string;
  };
}

interface MessageCommentsProps {
  messageId: string;
  userId: string | null;
  onUserClick: (userId: string) => void;
}

export const MessageComments: React.FC<MessageCommentsProps> = ({ 
  messageId, 
  userId, 
  onUserClick 
}) => {
  const [comments, setComments] = useState<MessageComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_comments')
        .select(`
          *,
          profiles!message_comments_user_id_fkey (
            name,
            profile_picture_url
          )
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [showComments, messageId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('message_comments')
        .insert({
          message_id: messageId,
          user_id: userId,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayName = (profiles: any) => {
    if (!profiles) return 'Anonymous User';
    return profiles.name && profiles.name.trim() !== '' ? profiles.name : 'Anonymous User';
  };

  const getAvatarFallback = (profiles: any) => {
    const displayName = getDisplayName(profiles);
    return displayName.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 p-0 h-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        <span className="text-sm">
          {comments.length > 0 ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : 'Comment'}
        </span>
        {showComments ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      {showComments && (
        <div className="mt-2 pl-4 border-l-2 border-gray-700">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-xs text-gray-400">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <button
                      onClick={() => onUserClick(comment.user_id)}
                      className="focus:outline-none focus:ring-1 focus:ring-primary rounded-full flex-shrink-0"
                    >
                      <Avatar className="h-6 w-6 hover:scale-105 transition-transform cursor-pointer">
                        <AvatarImage 
                          src={comment.profiles?.profile_picture_url || undefined} 
                          alt={getDisplayName(comment.profiles)}
                        />
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {getAvatarFallback(comment.profiles)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                    <div className="flex-1 min-w-0 bg-gray-800/30 rounded-lg px-3 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <button
                            onClick={() => onUserClick(comment.user_id)}
                            className="text-xs font-medium text-white hover:underline focus:outline-none focus:underline"
                          >
                            {getDisplayName(comment.profiles)}
                          </button>
                          <p className="text-xs text-gray-200 break-words mt-1">{comment.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        <button className="text-xs text-gray-400 hover:text-white">Like</button>
                        <button className="text-xs text-gray-400 hover:text-white">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userId && (
            <div className="mt-3">
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-gray-700 text-white text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 text-xs h-8 rounded-full"
                    disabled={submitting}
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={submitting || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-8 text-xs"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};