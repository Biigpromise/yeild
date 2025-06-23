
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ChatUserBadge } from './ChatUserBadge';
import { formatMessageTime, isImage, isVideo } from './utils/messageUtils';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
    tasks_completed?: number;
  };
}

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  onDelete: (messageId: string, messageUserId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  onDelete
}) => {
  // Fallback to Anonymous User if name is null, undefined, or empty
  const displayName = message.profiles?.name && message.profiles.name.trim() !== '' 
    ? message.profiles.name 
    : 'Anonymous User';
  
  console.log('MessageItem rendering:', { 
    messageId: message.id, 
    profilesData: message.profiles, 
    displayName 
  });
  
  return (
    <div className="flex items-start space-x-3 group">
      <ChatUserBadge
        userId={message.user_id}
        userName={displayName}
        userAvatar={message.profiles?.profile_picture_url}
        userTasksCompleted={message.profiles?.tasks_completed || 0}
        size="sm"
        showBirdBadge={true}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-white">
            {displayName}
          </span>
          <span className="text-xs text-gray-400">
            {formatMessageTime(message.created_at)}
          </span>
          {currentUserId && currentUserId === message.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(message.id, message.user_id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          {message.content && (
            <p className="text-sm break-words mb-2 text-white">{message.content}</p>
          )}
          {message.media_url && (
            <div className="mt-2">
              {isImage(message.media_url) && (
                <img
                  src={message.media_url}
                  alt="Shared media"
                  className="max-w-full max-h-48 rounded-lg border object-cover"
                  loading="lazy"
                />
              )}
              {isVideo(message.media_url) && (
                <video
                  src={message.media_url}
                  controls
                  className="max-w-full max-h-48 rounded-lg border"
                  preload="metadata"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
