import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Search, Plus, Users, MoreHorizontal } from 'lucide-react';
import { ChatList } from './ChatList';
import { EnhancedChatWindow } from '../chat/EnhancedChatWindow';

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
  const [searchTerm, setSearchTerm] = useState('');

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    onChatSelect?.(chat.id);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="flex h-full bg-background">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Messages</h2>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChat ? (
          <EnhancedChatWindow
            chatId={selectedChat.id}
            chatName={selectedChat.name}
            onClose={handleCloseChat}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/20">
            <Card className="p-8 max-w-md mx-4 text-center border-dashed">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-8 w-8 text-primary/60" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/30 animate-ping"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Select a Conversation</h3>
              <p className="text-muted-foreground mb-4">
                Choose a conversation from the sidebar to start messaging
              </p>
              <Button variant="outline" size="sm">
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