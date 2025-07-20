import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Smile,
  Copy,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    timestamp: string;
    messageType: 'text' | 'image' | 'file';
    mediaUrl?: string;
    reactions?: Array<{ emoji: string; userId: string; userName: string }>;
    isEdited?: boolean;
    replyTo?: {
      id: string;
      content: string;
      senderName: string;
    };
  };
  isOwnMessage: boolean;
  showAvatar: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
}

export const MessageBubble = ({
  message,
  isOwnMessage,
  showAvatar,
  onReact,
  onReply
}: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const getUniqueReactions = () => {
    const reactionMap = new Map();
    message.reactions?.forEach(reaction => {
      const key = reaction.emoji;
      if (reactionMap.has(key)) {
        reactionMap.get(key).count++;
        reactionMap.get(key).users.push(reaction.userName);
      } else {
        reactionMap.set(key, {
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.userName]
        });
      }
    });
    return Array.from(reactionMap.values());
  };

  const uniqueReactions = getUniqueReactions();

  return (
    <div className={`flex gap-3 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="text-xs">
            {message.senderName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'flex justify-end' : ''}`}>
        {/* Sender Name & Time */}
        {showAvatar && !isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{message.senderName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-2 p-2 border-l-2 bg-muted/30 rounded text-sm ${
            isOwnMessage ? 'border-l-primary/50' : 'border-l-secondary/50'
          }`}>
            <div className="font-medium text-xs text-muted-foreground">
              {message.replyTo.senderName}
            </div>
            <div className="text-muted-foreground truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl max-w-full break-words ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Message Content */}
          {message.messageType === 'text' && (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
          
          {message.messageType === 'image' && (
            <div>
              <img 
                src={message.mediaUrl} 
                alt="Shared image" 
                className="max-w-full rounded-lg mb-2"
              />
              {message.content && (
                <div className="whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          )}

          {/* Edited Indicator */}
          {message.isEdited && (
            <span className="text-xs opacity-70 ml-2">(edited)</span>
          )}

          {/* Timestamp for own messages */}
          {isOwnMessage && (
            <div className="text-xs opacity-70 mt-1 text-right">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </div>
          )}

          {/* Quick Reaction Buttons */}
          {showReactions && (
            <div className={`absolute top-0 flex gap-1 ${
              isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background shadow-md"
                onClick={() => onReact('❤️')}
              >
                ❤️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background shadow-md"
                onClick={() => onReact('👍')}
              >
                👍
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background shadow-md"
                onClick={() => onReact('😊')}
              >
                😊
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background shadow-md"
                onClick={onReply}
              >
                <Reply className="h-3 w-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-background shadow-md"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onReply}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  {isOwnMessage && (
                    <>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reactions */}
        {uniqueReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {uniqueReactions.map((reaction, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-2 py-1 text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => onReact(reaction.emoji)}
                title={reaction.users.join(', ')}
              >
                {reaction.emoji} {reaction.count}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};