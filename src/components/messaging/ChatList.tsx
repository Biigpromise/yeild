import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Search, 
  Users, 
  Plus,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

export const ChatList = ({ onChatSelect, selectedChatId }: ChatListProps) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      loadChats();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;

    try {
      // For now, use a simplified approach with mock data since tables are being created
      const mockChats: Chat[] = [
        {
          id: "1",
          name: "John Doe",
          isGroupChat: false,
          lastMessage: "Hey there! How are you doing?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          participants: [
            {
              id: "user1",
              name: "John Doe",
              avatar: undefined,
              isOnline: true
            }
          ]
        },
        {
          id: "2", 
          name: "Team Discussion",
          isGroupChat: true,
          lastMessage: "Let's meet tomorrow at 10 AM",
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0,
          participants: [
            {
              id: "user2",
              name: "Alice Smith",
              avatar: undefined,
              isOnline: false
            },
            {
              id: "user3", 
              name: "Bob Johnson",
              avatar: undefined,
              isOnline: true
            }
          ]
        }
      ];

      setChats(mockChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Create unique channel name to avoid conflicts
    const channel = supabase
      .channel(`chat_list_${user?.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        () => {
          loadChats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewChat = async () => {
    // This would open a dialog to select users and create a new chat
    toast.info("New chat feature coming soon!");
  };

  return (
    <Card className="h-[600px] w-80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={createNewChat}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading chats...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No chats found' : 'No messages yet'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors ${
                    selectedChatId === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback>
                        {chat.isGroupChat ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          chat.name.slice(0, 2).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {!chat.isGroupChat && chat.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{chat.name}</h3>
                      {chat.lastMessageTime && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 px-2 py-0 text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};