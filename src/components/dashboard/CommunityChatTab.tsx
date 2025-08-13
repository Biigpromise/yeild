import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, ImageIcon, Search, Heart, MessageCircle, Share, Eye, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { CommunityChatMessageComments } from './CommunityChatMessageComments';
interface CommunityChatTabProps {
  onToggleNavigation?: () => void;
}
export const CommunityChatTab: React.FC<CommunityChatTabProps> = ({
  onToggleNavigation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const {
    user
  } = useAuth();
  const {
    selectedUserId,
    isModalOpen,
    openUserProfile,
    closeUserProfile
  } = useUserProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the enhanced chat hook
  const {
    messages,
    loading,
    onlineUsers,
    sendMessage,
    addReaction,
    deleteMessage
  } = useEnhancedChat('community');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;
    try {
      await sendMessage(newMessage, {
        type: 'text'
      });
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    const loadingToast = toast.loading('Uploading image...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const {
        data: uploadData,
        error: uploadError
      } = await supabase.storage.from('chat-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const {
        data
      } = supabase.storage.from('chat-images').getPublicUrl(uploadData.path);
      await sendMessage(newMessage, {
        type: 'image',
        mediaUrl: data.publicUrl
      });
      setNewMessage('');
      toast.success('Image shared!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      toast.dismiss(loadingToast);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const handleLike = async (messageId: string) => {
    try {
      await addReaction(messageId, '❤️');
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };
  const handleComment = (messageId: string) => {
    setShowComments(showComments === messageId ? null : messageId);
  };
  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };
  const handleShare = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    const shareText = `Check out this message: "${message.content}"`;
    const shareUrl = `${window.location.origin}/social?message=${messageId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Message',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success('Message link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy message link');
      }
    }
  };
  const filteredMessages = messages.filter(message => message.content.toLowerCase().includes(searchQuery.toLowerCase()) || message.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="flex flex-col h-full bg-background">
      {/* Header */}
      

      {/* Search Bar */}
      <div className="bg-background/95 backdrop-blur-sm px-4 py-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 text-sm" />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {loading ? <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div> : filteredMessages.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg mb-2">
                  {searchQuery ? 'No messages found' : 'No messages yet'}
                </p>
                <p>{searchQuery ? 'Try different search terms' : 'Start the conversation!'}</p>
              </div> : filteredMessages.map(message => <Card key={message.id} className="p-4 bg-card/50">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={message.profiles?.profile_picture_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {message.profiles?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm cursor-pointer hover:underline" onClick={() => openUserProfile(message.user_id)}>
                          {message.profiles?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(message.created_at)}
                        </span>
                      </div>
                      
                      {message.content && <p className="text-sm mb-3 whitespace-pre-wrap break-words">
                          {message.content}
                        </p>}
                      
                      {message.media_url && <div className="mb-3">
                          <img src={message.media_url} alt="Shared content" className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(message.media_url, '_blank')} />
                        </div>}
                      
                      {/* Interaction buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleLike(message.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{message.reactions?.filter(r => r.emoji === '❤️').length || 0}</span>
                          </button>
                          <button onClick={() => handleComment(message.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>Comment</span>
                          </button>
                          <button onClick={() => handleShare(message.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-green-500 transition-colors">
                            <Share className="h-4 w-4" />
                            <span>Share</span>
                          </button>
                          {message.user_id === user?.id && <button onClick={() => handleDeleteMessage(message.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>0 views</span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <CommunityChatMessageComments messageId={message.id} isVisible={showComments === message.id} />
                    </div>
                  </div>
                </Card>)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input Area */}
      {user ? <div className="border-t border-border bg-background p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="relative">
                <textarea value={newMessage} onChange={e => {
              setNewMessage(e.target.value);
              // Auto-resize textarea
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }} onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim()) {
                  handleSendMessage();
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                }
              }
            }} placeholder="Share your thoughts w/1000" className="w-full min-h-[44px] max-h-[120px] p-3 pr-12 border border-input bg-background rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" rows={1} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="h-11 w-11 p-0" title="Add Photo">
                <Camera className="h-5 w-5" />
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 px-[30px] mx-[30px]">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div> : <div className="border-t border-border bg-muted/50 p-4">
          <p className="text-center text-muted-foreground">
            Please log in to join the conversation
          </p>
        </div>}

      {/* Modals */}
      {isModalOpen && selectedUserId && <PublicProfileModal userId={selectedUserId} isOpen={isModalOpen} onOpenChange={open => {
      if (!open) closeUserProfile();
    }} />}
    </div>;
};