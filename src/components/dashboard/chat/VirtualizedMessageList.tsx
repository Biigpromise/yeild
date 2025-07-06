import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { PostItem } from './PostItem';

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

interface VirtualizedMessageListProps {
  messages: Message[];
  messageLikes: Record<string, MessageLike[]>;
  currentUserId?: string;
  onLike: (messageId: string) => void;
  onShare: (messageId: string) => void;
  onUserClick: (userId: string) => void;
  onMediaClick: (mediaUrl: string) => void;
  height: number;
}

const MessageItem = React.memo(({ index, style, data }: any) => {
  const { messages, messageLikes, currentUserId, onLike, onShare, onUserClick, onMediaClick } = data;
  const message = messages[index];
  const likes = messageLikes[message.id] || [];
  const userHasLiked = likes.some(like => like.user_id === currentUserId);

  return (
    <div style={style}>
      <PostItem
        message={message}
        likes={likes}
        userHasLiked={userHasLiked}
        currentUserId={currentUserId}
        onLike={onLike}
        onShare={onShare}
        onUserClick={onUserClick}
        onMediaClick={onMediaClick}
      />
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  messageLikes,
  currentUserId,
  onLike,
  onShare,
  onUserClick,
  onMediaClick,
  height
}) => {
  const itemData = useMemo(() => ({
    messages,
    messageLikes,
    currentUserId,
    onLike,
    onShare,
    onUserClick,
    onMediaClick
  }), [messages, messageLikes, currentUserId, onLike, onShare, onUserClick, onMediaClick]);

  // Fixed item height for better performance
  const ITEM_HEIGHT = 250;

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-lg mb-2">No posts yet</p>
          <p>Be the first to share something!</p>
        </div>
      </div>
    );
  }

  return (
    <List
      height={height}
      width="100%"
      itemCount={messages.length}
      itemSize={ITEM_HEIGHT}
      itemData={itemData}
      className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
    >
      {MessageItem}
    </List>
  );
};