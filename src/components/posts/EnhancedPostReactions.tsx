import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface PostReactionsProps {
  postId: string;
  userId: string | null;
}

interface ReactionCount {
  emoji: string;
  count: number;
  userReacted: boolean;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const EnhancedPostReactions: React.FC<PostReactionsProps> = ({ postId, userId }) => {
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { trackSocialInteraction } = useAnalyticsTracking();

  const handleReaction = async (emoji: string) => {
    if (!userId) {
      toast.error('Please log in to react');
      return;
    }

    try {
      const hasReacted = userReactions.includes(emoji);
      
      if (hasReacted) {
        // Remove reaction
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .eq('emoji', emoji);
        
        if (error) throw error;
        
        setUserReactions(prev => prev.filter(e => e !== emoji));
        setReactions(prev => prev.map(r => 
          r.emoji === emoji 
            ? { ...r, count: Math.max(0, r.count - 1), userReacted: false }
            : r
        ));

        // Track reaction removal
        trackSocialInteraction('like', postId, 'post_reaction_removed');
      } else {
        // Add reaction
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: userId,
            emoji: emoji,
            reaction_type: 'like'
          });
        
        if (error) throw error;
        
        setUserReactions(prev => [...prev, emoji]);
        setReactions(prev => {
          const existingReaction = prev.find(r => r.emoji === emoji);
          if (existingReaction) {
            return prev.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, userReacted: true }
                : r
            );
          } else {
            return [...prev, { emoji, count: 1, userReacted: true }];
          }
        });

        // Track reaction addition with emoji type
        trackSocialInteraction('like', postId, 'post_reaction');
      }
      
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  };

  const loadReactions = async () => {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('emoji, user_id')
        .eq('post_id', postId);

      if (error) {
        console.error('Error loading reactions:', error);
        return;
      }

      const reactionCounts: { [key: string]: { count: number; userReacted: boolean } } = {};
      const currentUserReactions: string[] = [];

      data?.forEach(reaction => {
        const emoji = reaction.emoji || '👍';
        
        if (!reactionCounts[emoji]) {
          reactionCounts[emoji] = { count: 0, userReacted: false };
        }
        
        reactionCounts[emoji].count++;
        
        if (userId && reaction.user_id === userId) {
          reactionCounts[emoji].userReacted = true;
          currentUserReactions.push(emoji);
        }
      });

      const reactionsArray = Object.entries(reactionCounts).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        userReacted: data.userReacted
      }));

      setReactions(reactionsArray);
      setUserReactions(currentUserReactions);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  useEffect(() => {
    loadReactions();
  }, [postId, userId]);

  const totalReactions = reactions.reduce((sum, reaction) => sum + reaction.count, 0);

  return (
    <div className="flex items-center gap-2">
      {reactions.length > 0 && (
        <div className="flex items-center gap-1 mr-2">
          {reactions.slice(0, 3).map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReaction(reaction.emoji)}
              className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full border transition-colors ${
                reaction.userReacted 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-muted hover:bg-muted/80 border-border text-muted-foreground'
              }`}
            >
              <span className="text-base">{reaction.emoji}</span>
              <span className="text-xs">{reaction.count}</span>
            </button>
          ))}
          {reactions.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{reactions.length - 3} more
            </span>
          )}
        </div>
      )}

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-lg">👍</span>
            {totalReactions > 0 && (
              <span className="ml-1 text-xs">{totalReactions}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`p-2 rounded-full hover:bg-muted transition-colors ${
                  userReactions.includes(emoji) ? 'bg-primary/20' : ''
                }`}
                title={`React with ${emoji}`}
              >
                <span className="text-xl">{emoji}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
