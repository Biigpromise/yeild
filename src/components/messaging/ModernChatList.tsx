import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Users, 
  Plus,
  MoreHorizontal,
  MessageCircle,
  Phone,
  Video,
  Settings
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

interface ModernChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

export const ModernChatList = ({ onChatSelect, selectedChatId }: ModernChatListProps) => {
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
      const { data: chatData, error } = await supabase
        .from('direct_chats')
        .select(`
          id,
          name,
          is_group_chat,
          last_message_at,
          direct_chat_participants!inner (
            user_id,
            last_read_at
          ),
          direct_messages (
            id,
            content,
            created_at,
            user_id,
            profiles (
              name,
              profile_picture_url
            )
          )
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error loading chats:', error);
        toast.error('Failed to load chats');
        return;
      }

      const processedChats: Chat[] = await Promise.all(
        (chatData || []).map(async (chat: any) => {
          // Get participants data
          const { data: participantsData } = await supabase
            .from('direct_chat_participants')
            .select(`
              profiles (
                id,
                name,
                profile_picture_url
              )
            `)
            .eq('chat_id', chat.id)
            .neq('user_id', user.id);

          const participants = participantsData?.map((p: any) => ({
            id: p.profiles.id,
            name: p.profiles.name,
            avatar: p.profiles.profile_picture_url,
            isOnline: false // TODO: Add presence tracking
          })) || [];

          // Get unread count
          const { data: unreadData } = await supabase
            .rpc('get_unread_message_count', {
              chat_id_param: chat.id,
              user_id_param: user.id
            });

          const lastMessage = chat.direct_messages?.[0];
          
          return {
            id: chat.id,
            name: chat.is_group_chat 
              ? chat.name || 'Group Chat'
              : participants[0]?.name || 'Unknown User',
            isGroupChat: chat.is_group_chat,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            unreadCount: unreadData || 0,
            participants,
            avatar: chat.is_group_chat ? undefined : participants[0]?.avatar
          };
        })
      );

      setChats(processedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat_list_${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_chats'
        },
        () => loadChats()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        () => loadChats()
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
    toast.info("New chat feature coming soon!");
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm border-r border-border/50">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={createNewChat}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              {searchTerm ? 'No chats found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 'Try a different search term' : 'Start a new conversation to get chatting'}
            </p>
            <Button size="sm" onClick={createNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 group ${
                  selectedChatId === chat.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-background">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                      {chat.isGroupChat ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        chat.name.slice(0, 2).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {!chat.isGroupChat && chat.participants[0]?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                      {chat.name}
                    </h3>
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
                    <div className="flex items-center gap-2">
                      {chat.unreadCount > 0 && (
                        <Badge 
                          variant="default" 
                          className="ml-2 px-2 py-0 text-xs bg-primary text-primary-foreground min-w-[20px] h-5 flex items-center justify-center"
                        >
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};