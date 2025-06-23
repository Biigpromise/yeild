import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { fileUploadService } from '@/services/fileUploadService';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessagesList } from './chat/ChatMessagesList';
import { ChatInput } from './chat/ChatInput';
import { MediaModal } from './chat/MediaModal';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  profiles: {
    name: string;
    profile_picture_url?: string;
  } | null;
}

export const CommunityChatTab = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages...');
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            name,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      console.log('Raw messages data:', data);
      
      // Ensure all messages have proper profile data with better fallbacks
      const messagesWithProfiles = data?.map(message => {
        console.log('Processing message:', message.id, 'Profile data:', message.profiles);
        
        // Ensure we have valid profile data
        const profileData = message.profiles ? {
          name: message.profiles.name && message.profiles.name.trim() !== '' 
            ? message.profiles.name 
            : 'User',
          profile_picture_url: message.profiles.profile_picture_url || null
        } : {
          name: 'User',
          profile_picture_url: null
        };

        return {
          ...message,
          profiles: profileData
        };
      }) || [];
      
      console.log('Final processed messages:', messagesWithProfiles);
      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    if (userId !== user?.id) {
      console.log('Opening profile for user:', userId);
      setSelectedUserId(userId);
      setIsProfileModalOpen(true);
    }
  };

  const handleMediaClick = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
    setMediaModalOpen(true);
  };

  const handleFileSelect = (file: File) => {
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    if (!newMessage.trim() && !mediaFile) {
      toast.error('Please enter a message or select media');
      return;
    }

    setSending(true);
    
    try {
      let mediaUrl: string | null = null;

      if (mediaFile) {
        console.log('Uploading media file...');
        mediaUrl = await fileUploadService.uploadChatMedia(mediaFile);
        console.log('Media upload result:', mediaUrl);
        if (!mediaUrl) {
          toast.error('Failed to upload media');
          setSending(false);
          return;
        }
      }

      console.log('Inserting message with data:', {
        content: newMessage.trim(),
        user_id: user.id,
        media_url: mediaUrl
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
          ...(mediaUrl && { media_url: mediaUrl })
        });

      if (error) {
        console.error('Error inserting message:', error);
        throw error;
      }

      setNewMessage('');
      removeMedia();
      await loadMessages();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeUsers = new Set(messages.map(m => m.user_id)).size;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Please log in to access community chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <ChatHeader activeUsers={activeUsers} />
      
      <ChatMessagesList
        messages={messages}
        loading={loading}
        currentUserId={user.id}
        onUserClick={handleUserClick}
        onMediaClick={handleMediaClick}
      />

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        mediaFile={mediaFile}
        mediaPreview={mediaPreview}
        sending={sending}
        onSendMessage={handleSendMessage}
        onFileSelect={handleFileSelect}
        onRemoveMedia={removeMedia}
      />

      <MediaModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        mediaUrl={selectedMedia}
      />

      <PublicProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
};
