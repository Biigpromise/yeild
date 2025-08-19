import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { ModernChatList } from './ModernChatList';
import { ModernChatWindow } from './ModernChatWindow';

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

interface DirectMessagesInterfaceProps {
  onChatSelect?: (chatId: string) => void;
}

export const DirectMessagesInterface: React.FC<DirectMessagesInterfaceProps> = ({
  onChatSelect
}) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    onChatSelect?.(chat.id);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-background via-background to-background/50">
      {/* Chat List Sidebar */}
      <div className="w-80 lg:w-96 shrink-0">
        <ModernChatList
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-w-0">
        {selectedChat ? (
          <ModernChatWindow
            chatId={selectedChat.id}
            chatName={selectedChat.name}
            isGroupChat={selectedChat.isGroupChat}
            participants={selectedChat.participants}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted/20 via-muted/10 to-transparent">
            <Card className="p-8 max-w-md mx-4 text-center border-dashed bg-background/50 backdrop-blur-sm shadow-lg">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mx-auto shadow-lg">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-primary/40 to-primary/20 animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Select a Conversation
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Choose a conversation from the sidebar to start messaging, or create a new chat to connect with friends.
              </p>
              <Button 
                variant="outline" 
                className="bg-background/80 backdrop-blur-sm hover:bg-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};