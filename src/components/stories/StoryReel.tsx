import React, { useState, useEffect } from 'react';
import { userService, Story, UserProfile } from '@/services/userService';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle } from 'lucide-react';
import { StoryViewer } from './StoryViewer';
import { AddStoryModal } from './AddStoryModal';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface GroupedStory {
  user: Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'>;
  stories: Story[];
}

export const StoryReel: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [groupedStories, setGroupedStories] = useState<GroupedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  const fetchStories = async () => {
    setLoading(true);
    const fetchedStories = await userService.getStories();
    setStories(fetchedStories);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchStories();
    
    // Set up realtime subscription for story updates
    const channel = supabase
      .channel('stories-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        fetchStories();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'story_views' }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (stories.length > 0 && currentUser) {
      const groups: { [key: string]: GroupedStory } = {};
      
      stories.forEach(story => {
        if (story.user) {
          if (!groups[story.user_id]) {
            groups[story.user_id] = { user: story.user, stories: [] };
          }
          groups[story.user_id].stories.push(story);
        }
      });

      const allGroups = Object.values(groups);
      const myStoryGroup = allGroups.find(g => g.user.id === currentUser.id);
      const otherStoryGroups = allGroups.filter(g => g.user.id !== currentUser.id);
      
      // My story first, then others
      setGroupedStories(myStoryGroup ? [myStoryGroup, ...otherStoryGroups] : otherStoryGroups);

    } else {
        setGroupedStories([]);
    }
  }, [stories, currentUser]);
  
  const handleOpenViewer = (storyId: string) => {
    const index = stories.findIndex(s => s.id === storyId);
    if(index !== -1) {
        setSelectedStoryIndex(index);
        setViewerOpen(true);
    }
  };
  
  if (loading) {
    return (
      <div className="flex space-x-4 p-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-16 rounded-full" />)}
      </div>
    );
  }

  const myStories = groupedStories.find(g => g.user.id === currentUser?.id);

  return (
    <>
      <div className="w-full border-b">
        <div className="p-4 flex items-center space-x-4 overflow-x-auto">
          {/* Add my story button */}
          <div className="text-center flex-shrink-0">
            <button onClick={() => setAddModalOpen(true)} className="relative">
              <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
                {myStories ? (
                  <AvatarImage src={myStories.user.profile_picture_url || undefined} />
                ) : (
                  <AvatarFallback className="bg-transparent">
                    <PlusCircle className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
            </button>
            <p className="text-xs mt-1">Your Story</p>
          </div>

          {/* Stories from others */}
          {groupedStories.filter(g => g.user.id !== currentUser?.id).map(group => {
            const latestStory = group.stories[0];
            const totalViews = group.stories.reduce((sum, story) => sum + (story.view_count || 0), 0);
            
            return (
              <div key={group.user.id} className="text-center flex-shrink-0 cursor-pointer" onClick={() => handleOpenViewer(group.stories[0].id)}>
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-pink-500 p-0.5">
                    <AvatarImage src={group.user.profile_picture_url || undefined} />
                    <AvatarFallback>{group.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {totalViews > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalViews}
                    </div>
                  )}
                </div>
                <p className="text-xs mt-1 truncate w-16">{group.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(latestStory.created_at), { addSuffix: true })}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {viewerOpen && (
        <StoryViewer 
          isOpen={viewerOpen} 
          onOpenChange={setViewerOpen}
          stories={stories}
          initialStoryIndex={selectedStoryIndex}
          allGroupedStories={groupedStories}
          onClose={() => setViewerOpen(false)}
        />
      )}
      <AddStoryModal
        isOpen={addModalOpen}
        onOpenChange={setAddModalOpen}
        onStoryAdded={fetchStories}
      />
    </>
  );
};
