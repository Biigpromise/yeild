
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { userService } from '@/services/userService';
import { PostReply } from '@/types/post';
import { formatDistanceToNow } from 'date-fns';

interface PostRepliesProps {
  postId: string;
  userId: string | null;
  replyCount: number;
}

export const PostReplies: React.FC<PostRepliesProps> = ({ postId, userId, replyCount }) => {
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReplies = async () => {
    if (showReplies) {
      setLoading(true);
      const fetchedReplies = await userService.getPostReplies(postId);
      setReplies(fetchedReplies);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [showReplies, postId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || newReply.trim() === '') return;

    const success = await userService.addPostReply(postId, newReply);
    if (success) {
      setNewReply('');
      fetchReplies();
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReplies(!showReplies)}
        className="text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
      </Button>

      {showReplies && (
        <div className="space-y-3 pl-4 border-l-2 border-muted">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading replies...</p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.profile?.profile_picture_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {reply.profile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-xs font-medium">{reply.profile?.name || 'Anonymous'}</p>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}

          {userId && (
            <form onSubmit={handleSubmitReply} className="flex gap-2">
              <Input
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={newReply.trim() === ''}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
