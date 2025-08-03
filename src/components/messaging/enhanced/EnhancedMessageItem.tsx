import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { EnhancedMessage } from '@/hooks/useEnhancedChat';
import { MessageReactions } from './MessageReactions';
import { MessageThreads } from './MessageThreads';
import { VoicePlayer } from './VoiceMessage';

interface EnhancedMessageItemProps {
  message: EnhancedMessage;
  currentUserId?: string;
  onReply: (messageId: string) => void;
  onEdit: (message: EnhancedMessage) => void;
  onDelete: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onUserClick: (userId: string) => void;
  onMediaClick: (mediaUrl: string) => void;
}

export const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
  onUserClick,
  onMediaClick
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.user_id === currentUserId;

  const getDisplayName = () => {
    if (!message.profiles) return 'Anonymous User';
    return message.profiles.name && message.profiles.name.trim() !== '' 
      ? message.profiles.name 
      : 'Anonymous User';
  };

  const getAvatarFallback = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div 
      className="group hover:bg-muted/30 transition-colors duration-200 p-3"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <button
          onClick={() => onUserClick(message.user_id)}
          className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full flex-shrink-0"
        >
          <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer ring-1 ring-border">
            <AvatarImage 
              src={message.profiles?.profile_picture_url || undefined} 
              alt={getDisplayName()}
            />
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUserClick(message.user_id)}
                className="font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus:text-primary"
              >
                {getDisplayName()}
              </button>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
              {message.is_edited && (
                <Badge variant="secondary" className="text-xs">edited</Badge>
              )}
            </div>

            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReply(message.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {isOwnMessage && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(message)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(message.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Message Body */}
          <div className="space-y-3">
            {/* Text Content */}
            {message.content && (
              <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}

            {/* Media Content */}
            {message.media_url && (
              <div className="max-w-md">
                {message.message_type === 'image' && (
                  <img
                    src={message.media_url}
                    alt="Message attachment"
                    className="rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity max-w-full"
                    onClick={() => onMediaClick(message.media_url!)}
                  />
                )}
                
                {message.message_type === 'voice' && (
                  <VoicePlayer
                    audioUrl={message.media_url}
                    duration={message.voice_duration || 0}
                    transcript={message.voice_transcript}
                  />
                )}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions}
                onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
                currentUserId={currentUserId}
              />
            )}

            {/* Quick Actions */}
            <div className={`flex items-center gap-1 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onAddReaction(message.id, '👍')}
              >
                👍
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onAddReaction(message.id, '❤️')}
              >
                ❤️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onReply(message.id)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>

            {/* Threaded Replies */}
            {message.replies && message.replies.length > 0 && (
              <MessageThreads
                parentMessage={message}
                replies={message.replies}
                onReply={onReply}
                onAddReaction={onAddReaction}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};