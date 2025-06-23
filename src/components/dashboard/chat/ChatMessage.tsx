
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

interface ChatMessageProps {
  message: Message;
  currentUserId?: string;
  onUserClick: (userId: string) => void;
  onMediaClick: (mediaUrl: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onUserClick,
  onMediaClick
}) => {
  // Ensure we always have a display name, fallback to 'User' instead of 'Anonymous User'
  const displayName = message.profiles?.name || 'User';
  
  return (
    <div className="flex items-start gap-3">
      <div className="cursor-pointer flex-shrink-0" onClick={() => onUserClick(message.user_id)}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.profiles?.profile_picture_url} />
          <AvatarFallback className="bg-gray-700 text-white text-sm">
            {displayName.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <button 
            onClick={() => onUserClick(message.user_id)}
            className="font-medium text-sm text-white hover:text-blue-400 transition-colors"
          >
            {displayName}
          </button>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5 break-words max-w-full">
          {message.content && (
            <p className="text-sm text-gray-200 break-words whitespace-pre-wrap">{message.content}</p>
          )}
          {message.media_url && (
            <div className="mt-2 relative group">
              <div className="cursor-pointer" onClick={() => onMediaClick(message.media_url!)}>
                {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                  <video
                    src={message.media_url}
                    className="max-w-full max-h-40 rounded border object-cover"
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={message.media_url}
                    alt="Shared media"
                    className="max-w-full max-h-40 rounded border object-cover hover:opacity-80 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
