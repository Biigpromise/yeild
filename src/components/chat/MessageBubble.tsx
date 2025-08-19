import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, MoreVertical, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Message {
  id: string;
  content: string;
  user_id: string;
  sender_id: string;
  created_at: string;
  updated_at?: string;
  media_url?: string;
  likes_count?: number;
  views_count?: number;
  reply_count?: number;
  message_type: 'text' | 'image' | 'voice' | 'file';
  is_edited?: boolean;
  edit_count?: number;
  last_edited_at?: string;
  parent_message_id?: string;
  voice_duration?: number;
  voice_transcript?: string;
  chat_id?: string | null;
  sender?: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    user_id: string;
    created_at: string;
  }>;
  mentions?: Array<{
    id: string;
    mentioned_user_id: string;
    is_read: boolean;
    created_at: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onProfileClick: (userId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReaction,
  onReply,
  onProfileClick
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReactionClick = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  return (
    <div className={`flex gap-3 p-2 hover:bg-muted/10 rounded-lg transition-colors group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar 
          className="h-8 w-8 cursor-pointer"
          onClick={() => onProfileClick(message.sender_id)}
        >
          <AvatarImage src={message.sender?.profile_picture_url} />
          <AvatarFallback className="text-xs">
            {message.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span 
            className="text-sm font-medium cursor-pointer hover:underline"
            onClick={() => onProfileClick(message.sender_id)}
          >
            {message.sender?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {message.is_edited && (
            <Badge variant="outline" className="text-xs py-0 px-1">
              edited
            </Badge>
          )}
        </div>

        {/* Message Body */}
        <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
          <div className={`rounded-2xl px-3 py-2 ${
            isOwn 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {/* Media Content */}
            {message.media_url && message.message_type === 'image' && (
              <div className="mb-2">
                <img 
                  src={message.media_url} 
                  alt="Message attachment"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Text Content */}
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Voice Message */}
            {message.message_type === 'voice' && (
              <div className="flex items-center gap-2 mt-2">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  ▶️
                </Button>
                <div className="flex-1 h-1 bg-background/20 rounded">
                  <div className="h-full w-1/3 bg-background/50 rounded"></div>
                </div>
                <span className="text-xs opacity-70">
                  {Math.floor((message.voice_duration || 0) / 60)}:{String((message.voice_duration || 0) % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((reaction) => (
                <Button
                  key={reaction.id}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 py-0 text-xs hover:bg-muted"
                  onClick={() => handleReactionClick(reaction.emoji)}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Heart className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onReply(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>

          {/* Quick Reactions Panel */}
          {showReactions && (
            <div className="flex gap-1 mt-2 p-2 bg-background border rounded-lg shadow-md">
              {quickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => handleReactionClick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Reply Indicator */}
        {message.parent_message_id && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Replying to a message
          </div>
        )}
      </div>
    </div>
  );
};