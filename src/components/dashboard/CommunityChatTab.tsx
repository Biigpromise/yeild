
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Users, Heart, Share, MoreHorizontal, Lock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { fileUploadService } from '@/services/fileUploadService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { MediaModal } from './chat/MediaModal';
import { ChatHeader } from './chat/ChatHeader';
import { PostCreationForm } from './chat/PostCreationForm';
import { VirtualizedMessageList } from './chat/VirtualizedMessageList';
import { MessageComments } from './chat/MessageComments';
import { EnhancedBirdBadge } from '@/components/referral/EnhancedBirdBadge';
import { EmojiReactions } from '@/components/ui/emoji-reactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  media_url?: string;
  likes_count?: number;
  views_count?: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
    is_anonymous?: boolean;
  } | null;
}

interface MessageLike {
  id: string;
  message_id: string;
  user_id: string;
}

interface UserProfile {
  can_post_in_chat: boolean;
  tasks_completed: number;
  active_referrals_count: number;
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
  const [messageLikes, setMessageLikes] = useState<Record<string, MessageLike[]>>({});
  const [viewedMessages, setViewedMessages] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadMessages();
      loadMessageLikes();
      
      // Set up real-time subscriptions
      const messagesChannel = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      const likesChannel = supabase
        .channel('message-likes-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_likes'
          },
          () => {
            loadMessageLikes();
          }
        )
        .subscribe();

      const commentsChannel = supabase
        .channel('message-comments-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'message_comments'
          },
          () => {
            loadMessages(); // Reload to update comment counts
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(commentsChannel);
      };
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('can_post_in_chat, tasks_completed, active_referrals_count')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const trackMessageView = async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('increment_message_view', {
        message_id_param: messageId,
        user_id_param: user.id
      });
      
      if (error) {
        console.error('Error tracking message view:', error);
      }
    } catch (error) {
      console.error('Error in trackMessageView:', error);
    }
  };

  // Track message views when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && user) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId && !viewedMessages.has(messageId)) {
              trackMessageView(messageId);
              setViewedMessages(prev => new Set([...prev, messageId]));
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, user, viewedMessages]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages...');
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_user_id_fkey (
            name,
            profile_picture_url,
            is_anonymous
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }
      
      console.log('Raw messages data:', data);
      
      const messagesWithProfiles = data?.map(message => {
        console.log('Processing message:', message.id, 'Profile data:', message.profiles);
        
        let profileData;
        if (message.profiles && typeof message.profiles === 'object' && !('error' in message.profiles)) {
          const profiles = message.profiles as any;
          
          // Show real names for everyone - this is what the user wants
          let displayName = 'Anonymous User';
          if (profiles.name && profiles.name.trim() !== '') {
            displayName = profiles.name;
          }
          
          profileData = {
            name: displayName,
            profile_picture_url: profiles.profile_picture_url || null,
            is_anonymous: profiles.is_anonymous
          };
        } else {
          profileData = {
            name: 'Anonymous User',
            profile_picture_url: null,
            is_anonymous: false
          };
        }

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

  const loadMessageLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('message_likes')
        .select('*');

      if (error) throw error;

      const likesGrouped = data?.reduce((acc: any, like: any) => {
        if (!acc[like.message_id]) {
          acc[like.message_id] = [];
        }
        acc[like.message_id].push(like);
        return acc;
      }, {} as Record<string, MessageLike[]>) || {};

      setMessageLikes(likesGrouped);
    } catch (error) {
      console.error('Error loading message likes:', error);
    }
  };

  const handleLike = async (messageId: string) => {
    if (!user) {
      toast.error('Please log in to like messages');
      return;
    }

    try {
      const existingLike = messageLikes[messageId]?.find(like => like.user_id === user.id);

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('message_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        toast.success('Like removed');
      } else {
        // Like
        const { error } = await supabase
          .from('message_likes')
          .insert({
            message_id: messageId,
            user_id: user.id
          });

        if (error) throw error;
        toast.success('Message liked!');
      }

      loadMessageLikes();
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleShare = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (message && navigator.share) {
        await navigator.share({
          title: 'Check out this message',
          text: message.content,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${message?.content}\n\n${window.location.href}`);
        toast.success('Message copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share message');
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

    if (!userProfile?.can_post_in_chat) {
      toast.error('You need to complete requirements to post messages');
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

  const getDisplayName = (profiles: any) => {
    if (!profiles) return 'Anonymous User';
    return profiles.name && profiles.name.trim() !== '' ? profiles.name : 'Anonymous User';
  };

  const getAvatarFallback = (profiles: any) => {
    const displayName = getDisplayName(profiles);
    return displayName.charAt(0)?.toUpperCase() || 'U';
  };

  const activeUsers = new Set(messages.map(m => m.user_id)).size;

  const canPostInChat = userProfile?.can_post_in_chat || false;
  const tasksCompleted = userProfile?.tasks_completed || 0;
  const activeReferrals = userProfile?.active_referrals_count || 0;
  const tasksNeeded = Math.max(0, 1 - tasksCompleted);
  const referralsNeeded = Math.max(0, 3 - activeReferrals);

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-white/80" />
          <p className="text-lg text-white/90">Please log in to access community chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
      <ChatHeader activeUsers={activeUsers} />

      {/* Chat Unlock Banner */}
      {!canPostInChat && (
        <div className="p-6 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-400/20 rounded-full">
                <Lock className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-xl font-semibold text-white">Unlock Chat Posting</h3>
            </div>
            <p className="text-white/80 mb-4">
              Complete these requirements to start posting in the community chat:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${tasksCompleted >= 1 ? 'bg-green-400/20' : 'bg-white/10'}`}>
                  <Target className={`h-4 w-4 ${tasksCompleted >= 1 ? 'text-green-300' : 'text-white/60'}`} />
                </div>
                <span className={`${tasksCompleted >= 1 ? 'text-green-300' : 'text-white/80'}`}>
                  Complete {tasksNeeded > 0 ? `${tasksNeeded} more` : ''} task{tasksNeeded !== 1 ? 's' : ''} 
                  {tasksCompleted >= 1 ? ' ✓' : ` (${tasksCompleted}/1)`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${activeReferrals >= 3 ? 'bg-green-400/20' : 'bg-white/10'}`}>
                  <Users className={`h-4 w-4 ${activeReferrals >= 3 ? 'text-green-300' : 'text-white/60'}`} />
                </div>
                <span className={`${activeReferrals >= 3 ? 'text-green-300' : 'text-white/80'}`}>
                  Get {referralsNeeded > 0 ? `${referralsNeeded} more` : ''} active referral{referralsNeeded !== 1 ? 's' : ''}
                  {activeReferrals >= 3 ? ' ✓' : ` (${activeReferrals}/3)`}
                </span>
              </div>
            </div>
            <p className="text-white/60 mt-4 text-sm">
              You can still view all messages and interact with the community!
            </p>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No posts yet</p>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-0 pb-32 lg:pb-4">
            {messages.map((message) => {
              const likes = messageLikes[message.id] || [];
              const userHasLiked = likes.some(like => like.user_id === user?.id);
              
              return (
                <div key={message.id} className="border-b border-gray-800 bg-black" data-message-id={message.id}>
                  <div className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUserClick(message.user_id)}
                          className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                        >
                          <Avatar className="h-10 w-10 hover:scale-105 transition-transform cursor-pointer">
                            <AvatarImage 
                              src={message.profiles?.profile_picture_url || undefined} 
                              alt={getDisplayName(message.profiles)}
                            />
                            <AvatarFallback className="bg-gray-700 text-white">
                              {getAvatarFallback(message.profiles)}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUserClick(message.user_id)}
                                className="font-semibold text-white hover:underline focus:outline-none focus:underline"
                              >
                                {getDisplayName(message.profiles)}
                              </button>
                              <EnhancedBirdBadge 
                                userId={message.user_id} 
                                size="sm" 
                                showTooltip={true}
                                className="hover:scale-110 transition-transform" 
                              />
                            </div>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem 
                            onClick={() => handleShare(message.id)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            Share message
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => navigator.clipboard.writeText(message.content)}
                            className="text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            Copy text
                          </DropdownMenuItem>
                          {message.user_id === user?.id && (
                            <DropdownMenuItem 
                              onClick={() => toast.info('Delete feature coming soon')}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                              Delete message
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      {message.content && (
                        <p className="text-white text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                      
                      {message.media_url && (
                        <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => handleMediaClick(message.media_url!)}>
                          {message.media_url.includes('.mp4') || message.media_url.includes('.webm') ? (
                            <video
                              src={message.media_url}
                              className="w-full max-h-96 object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={message.media_url}
                              alt="Post media"
                              className="w-full max-h-96 object-cover hover:opacity-90 transition-opacity"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="pt-3 border-t border-gray-800 space-y-3">
                      {/* Emoji Reactions */}
                      <EmojiReactions messageId={message.id} className="px-1" />
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLike(message.id)}
                            className={`${userHasLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 hover:bg-red-500/10`}
                          >
                            <Heart className={`h-5 w-5 mr-2 ${userHasLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm">{likes.length > 0 ? likes.length : 'Like'}</span>
                          </Button>
                          
                          <MessageComments 
                            messageId={message.id}
                            userId={user?.id || null}
                            onUserClick={handleUserClick}
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleShare(message.id)}
                            className="text-gray-400 hover:text-green-500 hover:bg-green-500/10"
                          >
                            <Share className="h-5 w-5 mr-2" />
                            <span className="text-sm">Share</span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center text-gray-400 text-sm">
                          <span>{message.views_count || 0} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Creation */}
      {canPostInChat && (
        <div className="border-t border-gray-800 p-4 pb-32 lg:pb-4 bg-gray-900 flex-shrink-0">
          {mediaPreview && (
              <div className="mb-3 relative inline-block">
                <div className="relative">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} className="max-h-20 rounded border" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="max-h-20 rounded border" />
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeMedia}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-full"
                  disabled={sending}
                />
                
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="text-gray-400 hover:text-white"
                >
                  📷
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={sending || (!newMessage.trim() && !mediaFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                >
                  {sending ? '...' : 'Post'}
                </Button>
              </div>
            </form>
        </div>
      )}

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
