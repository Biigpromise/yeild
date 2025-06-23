
import React, { useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

interface ChatMessagesListProps {
  messages: Message[];
  loading: boolean;
  currentUserId?: string;
  onUserClick: (userId: string) => void;
  onMediaClick: (mediaUrl: string) => void;
}

export const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  loading,
  currentUserId,
  onUserClick,
  onMediaClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden min-h-0">
      <div className="h-full overflow-y-auto">
        <div className="p-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No messages yet</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onUserClick={onUserClick}
                onMediaClick={onMediaClick}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
