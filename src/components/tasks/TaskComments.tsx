import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  parent_comment_id: string | null;
  created_at: string;
  profiles?: {
    name: string | null;
  };
  replies?: TaskComment[];
}

interface TaskCommentsProps {
  taskId: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          id,
          task_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          profiles:user_id (name)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const topLevelComments: TaskComment[] = [];
      const repliesMap = new Map<string, TaskComment[]>();

      (data || []).forEach((comment: any) => {
        if (comment.parent_comment_id) {
          const existingReplies = repliesMap.get(comment.parent_comment_id) || [];
          repliesMap.set(comment.parent_comment_id, [...existingReplies, comment]);
        } else {
          topLevelComments.push({ ...comment, replies: [] });
        }
      });

      // Attach replies to parent comments
      topLevelComments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || [];
      });

      return topLevelComments;
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user!.id,
          content,
          parent_comment_id: parentId || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Comment added!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return;
    addCommentMutation.mutate({ content: newComment.trim() });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !user) return;
    addCommentMutation.mutate({ content: replyContent.trim(), parentId });
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderComment = (comment: TaskComment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(comment.profiles?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">
                {comment.profiles?.name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-foreground">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {comment.user_id === user?.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={() => deleteCommentMutation.mutate(comment.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => toggleReplies(comment.id)}
              >
                {expandedReplies.has(comment.id) ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyContent.trim() || addCommentMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Replies */}
          {expandedReplies.has(comment.id) && comment.replies?.map(reply => 
            renderComment(reply, true)
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Input */}
        {user ? (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                You
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share a tip or ask a question about this task..."
                className="min-h-[80px]"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sign in to join the discussion
          </p>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4 pt-4 border-t">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet. Be the first to share!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
