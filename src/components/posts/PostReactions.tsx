
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostReactionsProps {
  postId: string;
  userId: string | null;
}

export const PostReactions: React.FC<PostReactionsProps> = ({ postId, userId }) => {
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    if (!userId) return;

    try {
      if (userReaction === reactionType) {
        // Remove existing reaction using direct table operation
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        
        if (error) throw error;
        setUserReaction(null);
      } else {
        // Add or update reaction using upsert
        const { error } = await supabase
          .from('post_reactions')
          .upsert({
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType
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
        .eq('post_id', postId);

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
  }, [postId, userId]);

  return (
    <>
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
    </>
  );
};
