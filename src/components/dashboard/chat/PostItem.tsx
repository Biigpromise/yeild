import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, Share, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EnhancedBirdBadge } from '@/components/referral/EnhancedBirdBadge';
import { MessageComments } from './MessageComments';
import { EmojiReactions } from '@/components/ui/emoji-reactions';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  likes_count?: number;
  views_count?: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
    is_anonymous?: boolean;
  } | null;
}

interface MessageLike {
  id: string;
  message_id: string;
  user_id: string;
}

interface PostItemProps {
  message: Message;
  likes: MessageLike[];
  userHasLiked: boolean;
  currentUserId?: string;
  onLike: (messageId: string) => void;
  onShare: (messageId: string) => void;
  onUserClick: (userId: string) => void;
  onMediaClick: (mediaUrl: string) => void;
  onOpenCommentsModal?: (message: Message) => void;
}

export const PostItem: React.FC<PostItemProps> = ({
  message,
  likes,
  userHasLiked,
  currentUserId,
  onLike,
  onShare,
  onUserClick,
  onMediaClick,
  onOpenCommentsModal
}) => {
  const getDisplayName = (profiles: any) => {
    if (!profiles) return 'Anonymous User';
    return profiles.name && profiles.name.trim() !== '' ? profiles.name : 'Anonymous User';
  };

  const getAvatarFallback = (profiles: any) => {
    const displayName = getDisplayName(profiles);
    return displayName.charAt(0)?.toUpperCase() || 'U';
  };

  const handleDeleteMessage = () => {
    // TODO: Implement delete functionality
    toast.info('Delete feature coming soon');
  };

  return (
    <div className="group hover:bg-muted/30 transition-colors duration-200" data-message-id={message.id}>
      <div className="p-3 md:p-4">
        {/* Clean Message Card */}
        <div className="bg-card rounded-lg border border-border/50 p-3 md:p-4 shadow-sm">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <button
                onClick={() => onUserClick(message.user_id)}
                className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full flex-shrink-0"
              >
                <Avatar className="h-9 w-9 md:h-10 md:w-10 hover:scale-105 transition-transform cursor-pointer ring-1 ring-border">
                  <AvatarImage 
                    src={message.profiles?.profile_picture_url || undefined} 
                    alt={getDisplayName(message.profiles)}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-sm">
                    {getAvatarFallback(message.profiles)}
                  </AvatarFallback>
                </Avatar>
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => onUserClick(message.user_id)}
                    className="font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus:text-primary truncate text-sm md:text-base"
                  >
                    {getDisplayName(message.profiles)}
                  </button>
                  <EnhancedBirdBadge 
                    userId={message.user_id} 
                    size="sm" 
                    showTooltip={true}
                    className="hover:scale-110 transition-transform flex-shrink-0" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onShare(message.id)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                  Copy text
                </DropdownMenuItem>
                {message.user_id === currentUserId && (
                  <DropdownMenuItem 
                    onClick={handleDeleteMessage}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete message
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            {message.content && (
              <div className="mb-3">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words text-sm md:text-base">
                  {message.content}
                </p>
              </div>
            )}
            
            {message.media_url && (
              <div className="rounded-md overflow-hidden cursor-pointer border border-border/50 hover:border-primary/50 transition-colors" onClick={() => onMediaClick(message.media_url!)}>
                {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                  <video
                    src={message.media_url}
                    className="w-full max-h-80 object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={message.media_url}
                    alt="Post media"
                    className="w-full max-h-80 object-cover hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </div>

          {/* Emoji Reactions */}
          <div className="mb-3">
            <EmojiReactions messageId={message.id} />
          </div>

          {/* Post Actions - Organized in a clean row */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onLike(message.id)}
                  className={`${
                    userHasLiked 
                      ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30' 
                      : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  } transition-all duration-200 h-8 px-2 text-xs md:text-sm`}
                >
                  <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 mr-1 ${userHasLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likes.length > 0 ? likes.length : 'Like'}</span>
                </Button>
                
                <MessageComments 
                  messageId={message.id}
                  userId={currentUserId || null}
                  onUserClick={onUserClick}
                  onOpenCommentsModal={() => onOpenCommentsModal?.(message)}
                />
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onShare(message.id)}
                  className="text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-200 h-8 px-2 text-xs md:text-sm"
                >
                  <Share className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                  <span className="font-medium">Share</span>
                </Button>
              </div>
              
              <div className="flex items-center text-muted-foreground text-xs">
                <span>{message.views_count || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};