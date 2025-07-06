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
}

export const PostItem: React.FC<PostItemProps> = ({
  message,
  likes,
  userHasLiked,
  currentUserId,
  onLike,
  onShare,
  onUserClick,
  onMediaClick
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
    <div className="border-b border-gray-800 bg-black" data-message-id={message.id}>
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUserClick(message.user_id)}
              className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
            >
              <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
                <AvatarImage 
                  src={message.profiles?.profile_picture_url || undefined} 
                  alt={getDisplayName(message.profiles)}
                />
                <AvatarFallback className="bg-gray-700 text-white">
                  {getAvatarFallback(message.profiles)}
                </AvatarFallback>
              </Avatar>
            </button>
            
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUserClick(message.user_id)}
                    className="font-semibold text-white hover:underline focus:outline-none focus:underline"
                  >
                    {getDisplayName(message.profiles)}
                  </button>
                  <EnhancedBirdBadge 
                    userId={message.user_id} 
                    size="sm" 
                    showTooltip={true}
                    className="hover:scale-110 transition-transform" 
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem 
                onClick={() => onShare(message.id)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Share message
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Copy text
              </DropdownMenuItem>
              {message.user_id === currentUserId && (
                <DropdownMenuItem 
                  onClick={handleDeleteMessage}
                  className="text-red-400 hover:text-red-300 hover:bg-gray-700"
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
            <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          
          {message.media_url && (
            <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => onMediaClick(message.media_url!)}>
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
                  className="w-full max-h-96 object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
              )}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="pt-3 border-t border-gray-800 space-y-3">
          {/* Emoji Reactions */}
          <EmojiReactions messageId={message.id} className="px-1" />
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLike(message.id)}
                className={`${userHasLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 hover:bg-red-500/10`}
              >
                <Heart className={`h-5 w-5 mr-2 ${userHasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likes.length > 0 ? likes.length : 'Like'}</span>
              </Button>
              
              <MessageComments 
                messageId={message.id}
                userId={currentUserId || null}
                onUserClick={onUserClick}
              />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onShare(message.id)}
                className="text-gray-400 hover:text-green-500 hover:bg-green-500/10"
              >
                <Share className="h-5 w-5 mr-2" />
                <span className="text-sm">Share</span>
              </Button>
            </div>
            
            <div className="flex items-center text-gray-400 text-sm">
              <span>{message.views_count || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};