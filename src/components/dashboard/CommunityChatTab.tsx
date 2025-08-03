import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ImageIcon, Search, Mic, Sparkles, Bookmark, Filter, Phone, FileText, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { MessageCommentsModal } from './chat/MessageCommentsModal';
import { ChatHeader } from './chat/ChatHeader';
import { supabase } from '@/integrations/supabase/client';

// Enhanced imports
import { useEnhancedChat } from '@/hooks/useEnhancedChat';
import { EnhancedMessageItem } from '@/components/messaging/enhanced/EnhancedMessageItem';
import { MentionInput } from '@/components/messaging/enhanced/MentionInput';
import { VoiceRecorder } from '@/components/messaging/enhanced/VoiceMessage';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { SmartReplyPanel } from '@/components/messaging/enhanced/SmartReplyPanel';
import { AdvancedSearchPanel } from '@/components/messaging/enhanced/AdvancedSearchPanel';
import { MessageTemplates } from '@/components/messaging/enhanced/MessageTemplates';
import { VoiceInterface } from '@/components/voice/VoiceInterface';
import { FileShare } from '@/components/collaboration/FileShare';
import { CollaborativeWhiteboard } from '@/components/collaboration/CollaborativeWhiteboard';

interface CommunityChatTabProps {
  onToggleNavigation?: () => void;
}

export const CommunityChatTab: React.FC<CommunityChatTabProps> = ({ onToggleNavigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [showFileShare, setShowFileShare] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const { user } = useAuth();
  const { selectedUserId, isModalOpen, openUserProfile, closeUserProfile } = useUserProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  // Use the enhanced chat hook
  const {
    messages,
    loading,
    typingUsers,
    onlineUsers,
    replyToMessage,
    setReplyToMessage,
    editingMessage,
    setEditingMessage,
    draftMessage,
    setDraftMessage,
    sendMessage,
    editMessage,
    addReaction,
    deleteMessage,
    markAsRead,
    handleTyping
  } = useEnhancedChat('community');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle enhanced message features
  const handleSendMessage = async (content: string, mentions: string[] = []) => {
    await sendMessage(content, {
      type: 'text',
      mentions,
      parentMessageId: replyToMessage?.id
    });
    setReplyToMessage(null);
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!user?.id) return;

    try {
      // Upload voice to Supabase storage
      const fileName = `voice_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(uploadData.path);

      // Send voice message
      await sendMessage('', {
        type: 'voice',
        mediaUrl: data.publicUrl,
        voiceDuration: duration,
        parentMessageId: replyToMessage?.id
      });

      setReplyToMessage(null);
      setShowVoiceRecorder(false);
      toast.success('Voice message sent!');
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-images')
        .getPublicUrl(uploadData.path);

      await sendMessage(draftMessage, {
        type: 'image',
        mediaUrl: data.publicUrl,
        parentMessageId: replyToMessage?.id
      });

      setDraftMessage('');
      setReplyToMessage(null);
      toast.success('Image shared!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
          url: shareUrl,
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

  const handleMediaClick = (mediaUrl: string) => {
    window.open(mediaUrl, '_blank');
  };

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Chat Header */}
      <ChatHeader 
        activeUsers={onlineUsers.length} 
        onToggleNavigation={onToggleNavigation}
      />

      {/* Enhanced Search Bar */}
      <div className="border-b bg-card/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 md:h-9 text-sm"
              />
            </div>
            <div className="flex gap-1">
              <Button
                variant={showAdvancedSearch ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="h-8 px-2"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant={showSmartReplies ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSmartReplies(!showSmartReplies)}
                className="h-8 px-2"
                title="Smart Replies"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              <Button
                variant={showTemplates ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="h-8 px-2"
                title="Templates"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant={showVoiceInterface ? "default" : "outline"}
                size="sm"
                onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                className="h-8 px-2"
                title="Voice Assistant"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant={showFileShare ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFileShare(!showFileShare)}
                className="h-8 px-2"
                title="File Sharing"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={showWhiteboard ? "default" : "outline"}
                size="sm"
                onClick={() => setShowWhiteboard(!showWhiteboard)}
                className="h-8 px-2"
                title="Whiteboard"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 Enhancement Panels */}
      {showAdvancedSearch && (
        <div className="border-b border-border px-3 py-2 md:px-4">
          <div className="max-w-4xl mx-auto">
            <AdvancedSearchPanel
              onSearch={(filters) => {
                console.log('Advanced search:', filters);
                setShowAdvancedSearch(false);
              }}
              onClose={() => setShowAdvancedSearch(false)}
              isOpen={showAdvancedSearch}
            />
          </div>
        </div>
      )}

      {showSmartReplies && messages.length > 0 && (
        <div className="border-b border-border px-3 py-2 md:px-4">
          <div className="max-w-4xl mx-auto">
            <SmartReplyPanel
              recentMessages={messages.slice(-5)}
              onSelectReply={(reply) => {
                setDraftMessage(reply);
                setShowSmartReplies(false);
              }}
              currentUserId={user?.id}
            />
          </div>
        </div>
      )}

      {showTemplates && (
        <div className="border-b border-border px-3 py-2 md:px-4">
          <div className="max-w-4xl mx-auto">
            <MessageTemplates
              onSelectTemplate={(content) => {
                setDraftMessage(content);
                setShowTemplates(false);
              }}
            />
          </div>
        </div>
        )}

        {/* Voice Interface Panel */}
        {showVoiceInterface && (
          <div className="border-b border-border px-3 py-2 md:px-4">
            <div className="max-w-4xl mx-auto">
              <VoiceInterface
                onSpeakingChange={setAiSpeaking}
                onTranscriptUpdate={(transcript) => {
                  // Optionally handle voice transcripts
                  console.log('Voice transcript:', transcript);
                }}
              />
            </div>
          </div>
        )}

        {/* File Share Panel */}
        {showFileShare && (
          <div className="border-b border-border px-3 py-2 md:px-4">
            <div className="max-w-4xl mx-auto">
              <FileShare
                chatId="community"
                onFileShared={(file) => {
                  // Handle file shared
                  console.log('File shared:', file);
                  toast.success(`File "${file.name}" shared successfully!`);
                }}
              />
            </div>
          </div>
        )}

        {/* Whiteboard Panel */}
        {showWhiteboard && (
          <div className="border-b border-border px-3 py-2 md:px-4">
            <div className="max-w-4xl mx-auto">
              <CollaborativeWhiteboard
                chatId="community"
                onSave={(imageData) => {
                  // Handle whiteboard save
                  console.log('Whiteboard saved');
                }}
              />
            </div>
          </div>
        )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="flex-1 px-1">
          <div className="space-y-1">
            {/* Reply Preview */}
            {replyToMessage && (
              <div className="mx-4 mb-2 p-3 bg-muted/50 border-l-4 border-primary rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-primary">
                      Replying to {replyToMessage.profiles?.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {replyToMessage.content}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToMessage(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg mb-2">
                  {searchQuery ? 'No messages found' : 'No messages yet'}
                </p>
                <p>{searchQuery ? 'Try different search terms' : 'Start the conversation!'}</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <EnhancedMessageItem
                  key={message.id}
                  message={message}
                  currentUserId={user?.id}
                  onReply={(messageId) => setReplyToMessage(message)}
                  onEdit={setEditingMessage}
                  onDelete={deleteMessage}
                  onAddReaction={addReaction}
                  onUserClick={openUserProfile}
                  onMediaClick={handleMediaClick}
                />
              ))
            )}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="mx-4 mb-2">
                <TypingIndicator users={typingUsers.map(u => u.name)} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Message Input Area */}
      {user ? (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-4 space-y-3">
            {/* Editing Mode */}
            {editingMessage ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Editing message...
                </div>
                <div className="flex gap-2">
                  <Input
                    value={draftMessage}
                    onChange={(e) => {
                      setDraftMessage(e.target.value);
                      handleTyping(true);
                    }}
                    placeholder="Edit your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      editMessage(editingMessage.id, draftMessage);
                      setDraftMessage('');
                    }}
                    disabled={!draftMessage.trim()}
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingMessage(null);
                      setDraftMessage('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : showVoiceRecorder ? (
              /* Voice Recording Mode */
              <div className="space-y-2">
                <VoiceRecorder
                  onSendVoice={handleSendVoice}
                  disabled={!user}
                />
                <Button
                  onClick={() => setShowVoiceRecorder(false)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Cancel Voice Message
                </Button>
              </div>
            ) : (
              /* Normal Message Mode */
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <MentionInput
                    value={draftMessage}
                    onChange={(value) => {
                      setDraftMessage(value);
                      handleTyping(true);
                    }}
                    onSend={handleSendMessage}
                    placeholder="Type your message... Use @ to mention someone"
                    disabled={!user}
                    onTyping={handleTyping}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 px-3"
                    disabled={!user}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVoiceRecorder(true)}
                    className="h-10 px-3"
                    disabled={!user}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Message input tips */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>@ to mention • Voice messages available</span>
                {onlineUsers.length > 0 && (
                  <span>{onlineUsers.length} online</span>
                )}
              </div>
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-lg mb-2">Join the conversation</p>
          <p>Sign in to start chatting with the community</p>
        </div>
      )}

      {/* User Profile Modal */}
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeUserProfile();
        }}
      />

      {/* Message Comments Modal */}
      {selectedMessage && (
        <MessageCommentsModal
          message={selectedMessage}
          isOpen={isCommentsModalOpen}
          onClose={() => setSelectedMessage(null)}
          userId={user?.id}
          onUserClick={openUserProfile}
        />
      )}
    </div>
  );
};