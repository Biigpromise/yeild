import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MoreVertical, 
  Heart, 
  Smile, 
  ThumbsUp, 
  Flame, 
  Zap,
  Reply,
  Copy,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted?: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  message_type?: 'text' | 'image' | 'file';
  media_url?: string;
  reactions?: Reaction[];
  reply_to_message_id?: string;
  reply_to_message?: {
    id: string;
    content: string;
    sender?: {
      name: string;
    };
  };
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  showAvatar?: boolean;
  className?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onReaction,
  onReply,
  showAvatar = true,
  className
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
    setShowReactions(false);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  const handleReply = () => {
    onReply?.(message);
  };

  const getReactionIcon = (emoji: string) => {
    switch (emoji) {
      case '👍': return <ThumbsUp className="h-3 w-3" />;
      case '❤️': return <Heart className="h-3 w-3" />;
      case '🔥': return <Flame className="h-3 w-3" />;
      default: return <span className="text-xs">{emoji}</span>;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn(
      "flex gap-3 group hover:bg-muted/30 p-2 rounded-lg transition-colors",
      isCurrentUser && "flex-row-reverse",
      className
    )}>
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className="text-xs">
            {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[70%] space-y-1",
        isCurrentUser && "flex flex-col items-end"
      )}>
        {/* Header */}
        {showAvatar && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isCurrentUser && "flex-row-reverse"
          )}>
            <span className="font-medium">{message.sender?.name}</span>
            <span>{formatTime(message.created_at)}</span>
          </div>
        )}

        {/* Reply Preview */}
        {message.reply_to_message && (
          <div className={cn(
            "border-l-2 border-primary/50 pl-3 py-1 bg-muted/50 rounded text-xs",
            isCurrentUser && "border-r-2 border-l-0 pr-3 pl-0"
          )}>
            <div className="font-medium text-muted-foreground">
              {message.reply_to_message.sender?.name}
            </div>
            <div className="text-muted-foreground truncate">
              {message.reply_to_message.content}
            </div>
          </div>
        )}

        {/* Message Card */}
        <Card className={cn(
          "relative",
          isCurrentUser 
            ? "bg-primary text-primary-foreground border-primary/20" 
            : "bg-card border-border/50"
        )}>
          <div className="p-3">
            {/* Media Content */}
            {message.message_type === 'image' && message.media_url && (
              <div className="mb-2">
                <img 
                  src={message.media_url} 
                  alt="Shared image" 
                  className="rounded-md max-w-full h-auto max-h-64 object-cover"
                />
              </div>
            )}

            {/* Text Content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <Button
                    key={index}
                    variant={reaction.hasReacted ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleReaction(reaction.emoji)}
                  >
                    {getReactionIcon(reaction.emoji)}
                    {reaction.count > 1 && (
                      <span className="ml-1">{reaction.count}</span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={cn(
            "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
            isCurrentUser ? "left-2" : "right-2"
          )}>
            {/* Quick Reaction */}
            <Popover open={showReactions} onOpenChange={setShowReactions}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top">
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:scale-110 transition-transform"
                      onClick={() => handleReaction(emoji)}
                    >
                      <span className="text-sm">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Reply Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={handleReply}
            >
              <Reply className="h-3 w-3" />
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>
    </div>
  );
};