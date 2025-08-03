import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile, Plus } from 'lucide-react';
import { MessageReaction } from '@/hooks/useEnhancedChat';

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onAddReaction: (emoji: string) => void;
  currentUserId?: string;
}

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯', '👏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onAddReaction,
  currentUserId
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        users: [],
        userReacted: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user_id);
    if (reaction.user_id === currentUserId) {
      acc[reaction.emoji].userReacted = true;
    }
    return acc;
  }, {} as Record<string, { emoji: string; count: number; users: string[]; userReacted: boolean }>);

  const handleEmojiClick = (emoji: string) => {
    onAddReaction(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing reactions */}
      {Object.values(groupedReactions).map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.userReacted ? "secondary" : "outline"}
          size="sm"
          className={`h-7 px-2 text-xs transition-all duration-200 ${
            reaction.userReacted 
              ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => handleEmojiClick(reaction.emoji)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted/50"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-lg hover:bg-muted/50 transition-colors"
                onClick={() => handleEmojiClick(emoji)}
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
