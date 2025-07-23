
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    views_count: number;
    media_url?: string;
    profiles: {
      name: string;
      profile_picture_url?: string;
    };
  };
  currentUserId: string;
  onView: () => void;
  onProfileClick: (userId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  currentUserId, 
  onView, 
  onProfileClick 
}) => {
  const isOwnMessage = message.user_id === currentUserId;
  
  return (
    <div className={`flex gap-2 md:gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Profile Avatar - Make it clickable */}
      <button 
        onClick={() => onProfileClick(message.user_id)}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8 md:h-10 md:w-10 cursor-pointer">
          <AvatarImage src={message.profiles?.profile_picture_url} />
          <AvatarFallback className="text-xs md:text-sm">
            {message.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>
      
      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        {/* User name and timestamp */}
        <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={() => onProfileClick(message.user_id)}
            className="text-xs md:text-sm font-medium hover:underline cursor-pointer"
          >
            {message.profiles?.name || 'Anonymous'}
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        
        {/* Message bubble */}
        <div
          className={`inline-block max-w-full md:max-w-[70%] px-3 py-2 rounded-lg break-words ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          }`}
          onClick={onView}
        >
          {message.media_url && (
            <div className="mb-2">
              <img 
                src={message.media_url} 
                alt="Message media" 
                className="max-w-full rounded-md"
              />
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Message stats */}
        <div className={`flex items-center gap-3 mt-1 text-xs text-muted-foreground ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{message.views_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
