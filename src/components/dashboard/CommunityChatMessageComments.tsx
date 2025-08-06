import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    name: string;
    profile_picture_url?: string;
  };
}

interface CommunityChatMessageCommentsProps {
  messageId: string;
  isVisible: boolean;
}

export const CommunityChatMessageComments: React.FC<CommunityChatMessageCommentsProps> = ({
  messageId,
  isVisible
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, messageId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('message_comments')
        .select(`
          *,
          profiles:user_id (
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('message_comments')
        .insert({
          message_id: messageId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;
      
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
      <div className="space-y-3 mb-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={comment.profiles?.profile_picture_url} />
                <AvatarFallback className="text-xs">
                  {comment.profiles?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {comment.profiles?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {user && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-1 text-sm border rounded-lg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmitComment();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            Post
          </Button>
        </div>
      )}
    </div>
  );
};