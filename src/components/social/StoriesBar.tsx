
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { CreateStory } from './CreateStory';

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  profiles: {
    name: string;
    profile_picture_url?: string;
  };
}

interface StoriesBarProps {
  onStoryView?: (storyId: string) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ onStoryView }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
    
    // Set up realtime subscription with proper cleanup
    let channel: any = null;
    
    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('stories_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'stories'
          },
          async (payload) => {
            // Fetch the complete story with profile data
            const { data } = await supabase
              .from('stories')
              .select(`
                id,
                user_id,
                media_url,
                media_type,
                caption,
                created_at,
                expires_at,
                view_count,
                profiles:user_id (
                  name,
                  profile_picture_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setStories(prev => [data as Story, ...prev]);
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_url,
          media_type,
          caption,
          created_at,
          expires_at,
          view_count,
          profiles:user_id (
            name,
            profile_picture_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setStories((data || []) as Story[]);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (story: Story) => {
    if (user && story.user_id !== user.id) {
      // Track view
      try {
        await supabase
          .from('story_views')
          .insert({
            story_id: story.id,
            user_id: user.id
          });
      } catch (error) {
        // View might already exist, which is fine
      }
    }
    
    onStoryView?.(story.id);
  };

  if (loading) {
    return (
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-20 h-32 bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
      {/* Create Story Card */}
      {user && (
        <div className="flex-shrink-0 w-20">
          <CreateStory onStoryCreated={fetchStories} />
        </div>
      )}

      {/* Stories */}
      {stories.map((story) => (
        <div key={story.id} className="flex-shrink-0 w-20">
          <Card 
            className="relative h-32 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleStoryClick(story)}
          >
            {story.media_type === 'image' ? (
              <img 
                src={story.media_url} 
                alt="Story"
                className="w-full h-full object-cover"
              />
            ) : (
              <video 
                src={story.media_url} 
                className="w-full h-full object-cover"
                muted
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30">
              {/* User Avatar */}
              <Avatar className="absolute top-2 left-2 h-6 w-6 border-2 border-white">
                <AvatarImage src={story.profiles.profile_picture_url} />
                <AvatarFallback className="text-xs">
                  {story.profiles.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* User Name */}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium truncate">
                  {story.profiles.name || 'Anonymous'}
                </p>
                
                {/* Time and Views */}
                <div className="flex items-center justify-between text-xs text-white/80 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-2 w-2" />
                    {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-2 w-2" />
                    {story.view_count}
                  </span>
                </div>
              </div>

              {/* Caption if exists */}
              {story.caption && (
                <div className="absolute bottom-8 left-2 right-2">
                  <p className="text-white text-xs truncate bg-black/50 rounded px-1">
                    {story.caption}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}

      {stories.length === 0 && user && (
        <div className="flex-shrink-0 w-40">
          <Card className="h-32 flex items-center justify-center border-dashed">
            <p className="text-xs text-muted-foreground text-center">
              No stories yet.<br />Be the first to share!
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
