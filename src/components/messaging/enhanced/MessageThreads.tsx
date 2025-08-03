import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EnhancedMessage } from '@/hooks/useEnhancedChat';
import { MessageReactions } from './MessageReactions';

interface MessageThreadsProps {
  parentMessage: EnhancedMessage;
  replies: EnhancedMessage[];
  onReply: (parentId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

export const MessageThreads: React.FC<MessageThreadsProps> = ({
  parentMessage,
  replies,
  onReply,
  onAddReaction,
  currentUserId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (replies.length === 0) return null;

  return (
    <div className="ml-4 mt-2 border-l-2 border-border/50 pl-4">
      {/* Thread toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 mr-1" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-1" />
        )}
        <MessageSquare className="h-3 w-3 mr-1" />
        <span className="text-xs font-medium">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </span>
      </Button>

      {/* Replies */}
      {isExpanded && (
        <div className="mt-2 space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="group">
              <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6 ring-1 ring-border">
                  <AvatarImage src={reply.profiles?.profile_picture_url} />
                  <AvatarFallback className="text-xs">
                    {reply.profiles?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {reply.profiles?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                    {reply.is_edited && (
                      <span className="text-xs text-muted-foreground">(edited)</span>
                    )}
                  </div>

                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {reply.content}
                  </div>

                  {reply.media_url && (
                    <div className="mt-2">
                      {reply.message_type === 'image' ? (
                        <img
                          src={reply.media_url}
                          alt="Reply attachment"
                          className="max-w-xs rounded-md border border-border"
                        />
                      ) : reply.message_type === 'voice' ? (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md max-w-xs">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          <span className="text-xs text-muted-foreground">
                            Voice message ({reply.voice_duration}s)
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 bg-muted rounded-md max-w-xs">
                          <span className="text-xs text-muted-foreground">File attachment</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply reactions */}
                  {reply.reactions && reply.reactions.length > 0 && (
                    <div className="mt-2">
                      <MessageReactions
                        messageId={reply.id}
                        reactions={reply.reactions}
                        onAddReaction={(emoji) => onAddReaction(reply.id, emoji)}
                        currentUserId={currentUserId}
                      />
                    </div>
                  )}

                  {/* Reply actions */}
                  <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => onReply(reply.id)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Reply button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onReply(parentMessage.id)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Reply to thread
          </Button>
        </div>
      )}
    </div>
  );
};