import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { chatService, Message } from '@/services/chatService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { userService, Story, UserProfile } from '@/services/userService';
import { StoryViewer } from '@/components/stories/StoryViewer';

export const CommunityChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for public profile modal
  const [profileModalUserId, setProfileModalUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Stories
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<
    { user: Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'>; stories: Story[] }[]
  >([]);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerStories, setStoryViewerStories] = useState<Story[]>([]);
  const [storyViewerUserGroupIndex, setStoryViewerUserGroupIndex] = useState(0);
  const [storyViewerInitIndex, setStoryViewerInitIndex] = useState(0);

  // Keep a list of user IDs with at least one active story for quick lookup
  const userIdsWithActiveStories = groupedStories.map(g => g.user.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const initialMessages = await chatService.getMessages();
      setMessages(initialMessages);
      setLoading(false);
    };
    fetchMessages();
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const channel = chatService.subscribeToMessages(async (payload) => {
      if (payload.new && payload.new.id) {
          const fullMessage = await chatService.getMessageWithProfile(payload.new.id);
          if (fullMessage) {
            setMessages((prevMessages) => [...prevMessages, fullMessage]);
          }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch all stories for feed, group by user
  useEffect(() => {
    const fetchStories = async () => {
      const fetchedStories = await userService.getStories();
      setStories(fetchedStories);

      // Group by user_id
      const groups: { [key: string]: { user: Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'>; stories: Story[] } } = {};
      fetchedStories.forEach(story => {
        if (story.user) {
          if (!groups[story.user_id]) {
            groups[story.user_id] = { user: story.user, stories: [] };
          }
          groups[story.user_id].stories.push(story);
        }
      });
      setGroupedStories(Object.values(groups));
    };
    fetchStories();
  }, []);

  // Add a list of offensive words
  const OFFENSIVE_WORDS = ['sex', 'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'cunt', 'nigger', 'fag', 'slut'];

  // Utility function to check for profanity (case-insensitive, simple match)
  const containsProfanity = (text: string) => {
    const lowerText = text.toLowerCase();
    return OFFENSIVE_WORDS.some((word) => lowerText.includes(word));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !userId) return;

    // Check for offensive language
    if (containsProfanity(newMessage)) {
      toast({
        title: "Message Blocked",
        description: "Your message contains inappropriate language and cannot be sent.",
        variant: "destructive"
      });
      return;
    }

    const success = await chatService.sendMessage(newMessage, userId);
    if (success) {
      setNewMessage('');
    } else {
      toast({
          title: "Error",
          description: "Could not send message. Please try again.",
          variant: "destructive"
      })
    }
  };

  // Open profile modal (from avatar or name)
  const openProfile = (userId: string | null) => {
    if (!userId || userId === null) return;
    setProfileModalUserId(userId);
    setProfileModalOpen(true);
  };

  // Open story viewer for a given user if they have stories
  const openStoryViewerForUser = (userId: string) => {
    const groupIndex = groupedStories.findIndex(g => g.user.id === userId);
    if (groupIndex !== -1) {
      setStoryViewerStories(groupedStories[groupIndex].stories);
      setStoryViewerInitIndex(0);
      setStoryViewerUserGroupIndex(groupIndex);
      setStoryViewerOpen(true);
    } else {
      toast({
        title: "No stories",
        description: "This user has no recent stories.",
        variant: "default"
      });
    }
  };

  // Called when closing the viewer, to reset
  const closeStoryViewer = () => {
    setStoryViewerOpen(false);
    setStoryViewerStories([]);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading chat...</div>;
  }

  // Render PublicProfileModal with an additional "View Stories" button if available
  const renderProfileModal = () => {
    if (!profileModalUserId) return null;

    const hasStories = userIdsWithActiveStories.includes(profileModalUserId);

    return (
      <PublicProfileModal
        userId={profileModalUserId}
        isOpen={profileModalOpen}
        onOpenChange={(open) => setProfileModalOpen(open)}
        extraActions={hasStories ? [
          <Button
            key="view-stories"
            variant="secondary"
            className="w-full mt-2"
            onClick={() => {
              setProfileModalOpen(false);
              setTimeout(() => openStoryViewerForUser(profileModalUserId), 150); // ensure modal closes before opening viewer
            }}
          >
            View Stories
          </Button>
        ] : undefined}
      />
    );
  };

  return (
    <>
      <div className="flex flex-col h-[600px] border rounded-lg">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.user_id === userId ? 'justify-end' : ''}`}>
                {msg.user_id !== userId && (
                  <button
                    type="button"
                    className="outline-none focus:ring-2 rounded-full"
                    onClick={() => openProfile(msg.user_id)}
                    tabIndex={0}
                    aria-label={`View profile of ${msg.profiles?.name || 'User'}`}
                  >
                    <Avatar className="h-8 w-8 hover:scale-105 transition">
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(msg.profiles?.name || 'U')}`} />
                      <AvatarFallback>{(msg.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                )}
                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                    msg.user_id === userId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                  {/* User name clickable if not yourself */}
                  {msg.user_id !== userId ? (
                    <button
                      type="button"
                      className="text-xs font-semibold mb-1 hover:underline hover:text-primary focus:outline-none"
                      style={{ display: 'block', textAlign: 'left' }}
                      onClick={() => openProfile(msg.user_id)}
                      tabIndex={0}
                      aria-label={`View profile of ${msg.profiles?.name || 'User'}`}
                    >
                      {msg.profiles?.name || 'Anonymous'}
                    </button>
                  ) : null}
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className="text-xs text-right mt-1 opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {msg.user_id === userId && (
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(msg.profiles?.name || 'U')}`} />
                      <AvatarFallback>{(msg.profiles?.name || 'U').charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={!userId}
              autoComplete="off"
            />
            <Button type="submit" disabled={!userId || newMessage.trim() === ''}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Public Profile Modal (with View Stories action if user has stories) */}
      {renderProfileModal()}

      {/* Story Viewer for selected user */}
      {storyViewerOpen && (
        <StoryViewer
          isOpen={storyViewerOpen}
          onOpenChange={open => setStoryViewerOpen(open)}
          stories={storyViewerStories}
          initialStoryIndex={storyViewerInitIndex}
          allGroupedStories={groupedStories}
          onClose={closeStoryViewer}
        />
      )}
    </>
  );
};
