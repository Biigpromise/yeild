import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MoreHorizontal, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  views_count: number;
  media_url?: string;
  message_type?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

interface ModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isGrouped: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onProfileClick: () => void;
}

export const ModernMessageBubble: React.FC<ModernMessageBubbleProps> = ({
  message,
  isOwn,
  isGrouped,
  isFirstInGroup,
  isLastInGroup,
  onProfileClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    // TODO: Implement actual like functionality
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-1 hover:bg-muted/30 transition-colors duration-200 relative",
        isOwn && "flex-row-reverse",
        isGrouped && !isFirstInGroup && "mt-0.5",
        !isGrouped && "mt-4"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className={cn("flex-shrink-0", isGrouped && !isFirstInGroup && "invisible")}>
        <Avatar 
          className={cn(
            "cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200",
            isOwn ? "ml-2" : "mr-2",
            "w-8 h-8"
          )}
          onClick={onProfileClick}
        >
          <AvatarImage 
            src={message.profiles?.profile_picture_url} 
            alt={message.profiles?.name || 'User'} 
          />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-primary/10">
            {getUserInitials(message.profiles?.name || 'User')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0 max-w-2xl", isOwn && "flex flex-col items-end")}>
        {/* Username and timestamp (only show for first message in group) */}
        {isFirstInGroup && (
          <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
            <button 
              onClick={onProfileClick}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              {message.profiles?.name || 'Anonymous'}
            </button>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className={cn("relative group")}>
          <div
            className={cn(
              "p-3 rounded-2xl shadow-sm border transition-all duration-200",
              isOwn 
                ? "bg-primary text-primary-foreground border-primary/20" 
                : "bg-card border-border hover:bg-card/80",
              isGrouped && isFirstInGroup && "rounded-tl-md",
              isGrouped && isLastInGroup && "rounded-bl-md",
              isGrouped && !isFirstInGroup && !isLastInGroup && "rounded-l-md",
              isOwn && isGrouped && isFirstInGroup && "rounded-tr-md",
              isOwn && isGrouped && isLastInGroup && "rounded-br-md",
              isOwn && isGrouped && !isFirstInGroup && !isLastInGroup && "rounded-r-md"
            )}
          >
            {/* Media content */}
            {message.media_url && (
              <div className="mb-2">
                <img 
                  src={message.media_url} 
                  alt="Shared image"
                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <p className={cn(
                "text-sm leading-relaxed break-words whitespace-pre-wrap",
                isOwn ? "text-primary-foreground" : "text-foreground"
              )}>
                {message.content}
              </p>
            )}
          </div>

          {/* Hover actions */}
          {isHovered && (
            <div className={cn(
              "absolute flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10",
              isOwn ? "-left-20 top-0" : "-right-20 top-0"
            )}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={handleLike}
              >
                <Heart className={cn("h-3 w-3", liked && "fill-red-500 text-red-500")} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <Share2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-muted"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Message stats (only show for last message in group) */}
        {isLastInGroup && message.views_count > 0 && (
          <div className={cn("flex items-center gap-1 mt-1 text-xs text-muted-foreground", isOwn && "justify-end")}>
            <Eye className="h-3 w-3" />
            <span>{message.views_count} views</span>
          </div>
        )}
      </div>
    </div>
  );
};