import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Users, MessageCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  profile_picture_url?: string;
  is_online?: boolean;
}

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: (chatId: string) => void;
}

export const NewChatDialog = ({ open, onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      // Reset state when dialog closes
      setSearchTerm('');
      setSelectedUsers([]);
      setIsGroupChat(false);
      setGroupName('');
    }
  }, [open]);

  useEffect(() => {
    if (selectedUsers.length > 1 && !isGroupChat) {
      setIsGroupChat(true);
    } else if (selectedUsers.length <= 1 && isGroupChat) {
      setIsGroupChat(false);
    }
  }, [selectedUsers.length, isGroupChat]);

  const loadUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url')
        .neq('id', user.id)
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.some(selected => selected.id === u.id)
  );

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const createChat = async () => {
    if (selectedUsers.length === 0 || !user) return;

    setCreating(true);
    try {
      const chatName = isGroupChat 
        ? groupName || selectedUsers.map(u => u.name).join(', ')
        : selectedUsers[0]?.name;

      // Create the chat
      const { data: chat, error: chatError } = await supabase
        .from('direct_chats')
        .insert({
          created_by: user.id,
          is_group_chat: isGroupChat,
          name: isGroupChat ? chatName : null,
          description: isGroupChat ? `Group chat with ${selectedUsers.length} members` : null
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add current user as participant
      const participants = [
        { chat_id: chat.id, user_id: user.id },
        ...selectedUsers.map(u => ({
          chat_id: chat.id,
          user_id: u.id
        }))
      ];

      const { error: participantsError } = await supabase
        .from('direct_chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast.success(isGroupChat ? 'Group chat created!' : 'Direct chat created!');
      onChatCreated?.(chat.id);
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Selected:</span>
                <Badge variant="secondary">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 text-sm"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback className="text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => removeSelectedUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Chat Name (if group) */}
          {isGroupChat && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Name (Optional)
              </label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          {/* Users List */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Users</div>
            <ScrollArea className="h-48">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="w-8 h-8 bg-muted rounded-full" />
                      <div className="h-4 bg-muted rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No users found' : 'No users available'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleUserSelection(u)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.profile_picture_url} />
                        <AvatarFallback className="text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{u.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={createChat}
              disabled={selectedUsers.length === 0 || creating}
              className="flex-1"
            >
              {creating ? 'Creating...' : `Create ${isGroupChat ? 'Group' : 'Chat'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};