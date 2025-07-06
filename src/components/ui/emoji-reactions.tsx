import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Smile } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Reaction {
  id: string;
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface EmojiReactionsProps {
  messageId: string;
  className?: string;
}

const EMOJI_OPTIONS = [
  '👍', '❤️', '😂', '😮', '😢', '😡',
  '🔥', '👏', '🎉', '💯', '👀', '🚀'
];

export const EmojiReactions: React.FC<EmojiReactionsProps> = ({
  messageId,
  className = ""
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReactions();
    setupRealTimeUpdates();
  }, [messageId]);

  const loadReactions = async () => {
    try {
      const { data: reactionsData, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        console.error('Error loading reactions:', error);
        setReactions([]);
        return;
      }

      // Group reactions by emoji
      const reactionGroups = reactionsData?.reduce((acc: any, reaction: any) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = {
            id: reaction.emoji,
            emoji: reaction.emoji,
            count: 0,
            users: [],
            hasReacted: false
          };
        }
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.user_id);
        if (user && reaction.user_id === user.id) {
          acc[reaction.emoji].hasReacted = true;
        }
        return acc;
      }, {}) || {};

      setReactions(Object.values(reactionGroups));
    } catch (error) {
      console.error('Error loading reactions:', error);
      setReactions([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const channel = supabase
      .channel(`message-reactions-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=eq.${messageId}`
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const existingReaction = reactions.find(r => r.emoji === emoji);
      
      if (existingReaction?.hasReacted) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.id}
          variant={reaction.hasReacted ? "default" : "outline"}
          size="sm"
          className="h-6 px-2 py-1 text-xs"
          onClick={() => handleReaction(reaction.emoji)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          {reaction.count}
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
