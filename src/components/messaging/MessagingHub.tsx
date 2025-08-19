import React, { useState } from "react";
import { ChatList } from "./ChatList";
import { EnhancedChatWindow } from "../chat/EnhancedChatWindow";
import { ModernChatInterface } from "../chat/ModernChatInterface";

interface Chat {
  id: string;
  name: string;
  isGroupChat: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  avatar?: string;
}

export const MessagingHub = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-full">
      {/* Show modern community chat interface directly */}
      <div className="flex-1">
        <ModernChatInterface />
      </div>
    </div>
  );
};