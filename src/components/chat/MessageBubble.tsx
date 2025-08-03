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
import { UserProfileModal } from '../community/UserProfileModal';

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
  isOwn: boolean;
  onReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onProfileClick?: (userId: string) => void;
  className?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReaction,
  onReply,
  onProfileClick,
  className
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
    setShowReactions(false);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  const handleProfileClick = () => {
    if (onProfileClick && message.sender_id) {
      onProfileClick(message.sender_id);
    } else {
      setShowProfileModal(true);
    }
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
    <>
      <div className={cn(
        "group flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors rounded-lg",
        isOwn && "flex-row-reverse",
        className
      )}>
        {/* Avatar */}
        <Avatar 
          className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" 
          onClick={handleProfileClick}
        >
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {message.sender?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className={cn("flex-1 min-w-0", isOwn && "flex flex-col items-end")}>
          {/* Sender Name */}
          <div 
            className="text-xs font-medium text-muted-foreground mb-1 cursor-pointer hover:text-primary transition-colors" 
            onClick={handleProfileClick}
          >
            {message.sender?.name || 'Unknown User'}
          </div>

          {/* Reply Preview */}
          {message.reply_to_message && (
            <div className={cn(
              "border-l-2 border-primary/50 pl-3 py-1 bg-muted/50 rounded text-xs mb-2",
              isOwn && "border-r-2 border-l-0 pr-3 pl-0"
            )}>
              <div className="font-medium text-muted-foreground">
                {message.reply_to_message.sender?.name}
              </div>
              <div className="text-muted-foreground truncate">
                {message.reply_to_message.content}
              </div>
            </div>
          )}

          {/* Message Content */}
          <div className={cn(
            "relative group/message bg-background/80 backdrop-blur border-0 rounded-2xl px-4 py-3 shadow-lg",
            isOwn 
              ? "bg-primary/10 text-foreground" 
              : "bg-card/50"
          )}>
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

            {/* Action Buttons */}
            <div className={cn(
              "absolute top-2 opacity-0 group-hover/message:opacity-100 transition-opacity flex items-center gap-1",
              isOwn ? "left-2" : "right-2"
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

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground mt-1">
              {formatTime(message.created_at)}
            </div>
          </div>
        </div>
      </div>
      
      <UserProfileModal
        userId={message.sender_id}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onMessage={(userId) => {
          setShowProfileModal(false);
          onProfileClick?.(userId);
        }}
      />
    </>
  );
};