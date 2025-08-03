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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Modern Message Card */}
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => onUserClick(message.user_id)}
                className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full"
              >
                <Avatar className="h-11 w-11 hover:scale-105 transition-transform cursor-pointer ring-2 ring-border hover:ring-primary/30">
                  <AvatarImage 
                    src={message.profiles?.profile_picture_url || undefined} 
                    alt={getDisplayName(message.profiles)}
                  />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {getAvatarFallback(message.profiles)}
                  </AvatarFallback>
                </Avatar>
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => onUserClick(message.user_id)}
                    className="font-semibold text-foreground hover:text-primary transition-colors focus:outline-none focus:text-primary truncate"
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
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="mb-4">
            {message.content && (
              <div className="prose prose-sm max-w-none dark:prose-invert mb-3">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            )}
            
            {message.media_url && (
              <div className="rounded-lg overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-colors" onClick={() => onMediaClick(message.media_url!)}>
                {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                  <video
                    src={message.media_url}
                    className="w-full max-h-96 object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={message.media_url}
                    alt="Post media"
                    className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                )}
              </div>
            )}
          </div>

          {/* Emoji Reactions */}
          <div className="mb-3">
            <EmojiReactions messageId={message.id} className="px-1" />
          </div>

          {/* Post Actions */}
          <div className="pt-3 border-t border-border">
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
                  } transition-all duration-200`}
                >
                  <Heart className={`h-4 w-4 mr-1.5 ${userHasLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likes.length > 0 ? likes.length : 'Like'}</span>
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
                  className="text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all duration-200"
                >
                  <Share className="h-4 w-4 mr-1.5" />
                  <span className="text-sm font-medium">Share</span>
                </Button>
              </div>
              
              <div className="flex items-center text-muted-foreground text-sm">
                <span>{message.views_count || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};