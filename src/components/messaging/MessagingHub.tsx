import React, { useState } from "react";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

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
    <div className="flex gap-4 p-4">
      <ChatList 
        onChatSelect={handleChatSelect} 
        selectedChatId={selectedChat?.id}
      />
      
      {selectedChat ? (
        <ChatWindow
          chatId={selectedChat.id}
          chatName={selectedChat.name}
          isGroupChat={selectedChat.isGroupChat}
          participants={selectedChat.participants}
          onClose={handleCloseChat}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
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