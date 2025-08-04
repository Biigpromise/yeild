import React, { useState } from "react";
import { ChatList } from "./ChatList";
import { EnhancedChatWindow } from "../chat/EnhancedChatWindow";

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
      {/* Chat List - Always visible on larger screens, hidden on mobile when chat is selected */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80`}>
        <ChatList 
          onChatSelect={handleChatSelect} 
          selectedChatId={selectedChat?.id}
        />
      </div>
      
      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <EnhancedChatWindow
            chatId={selectedChat.id}
            chatName={selectedChat.name}
            onClose={handleCloseChat}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
            <p>Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  );
};