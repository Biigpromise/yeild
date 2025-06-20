import React, { useState, useEffect } from 'react';
import { Story, UserProfile } from '@/services/userService';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';

interface StoryViewerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stories: Story[];
  initialStoryIndex: number;
  allGroupedStories: { user: Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'>, stories: Story[] }[];
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ isOpen, onOpenChange, stories, initialStoryIndex, allGroupedStories, onClose }) => {
  const [currentUserStories, setCurrentUserStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen && stories.length > 0) {
      const initialStory = stories[initialStoryIndex];
      const groupIndex = allGroupedStories.findIndex(g => g.user.id === initialStory.user_id);
      
      if (groupIndex !== -1) {
        const group = allGroupedStories[groupIndex];
        setCurrentGroupIndex(groupIndex);
        setCurrentUserStories(group.stories);
        const storyIndex = group.stories.findIndex(s => s.id === initialStory.id);
        setCurrentStoryIndex(storyIndex !== -1 ? storyIndex : 0);
      }
    }
  }, [isOpen, stories, initialStoryIndex, allGroupedStories]);

  // Track story view when story changes
  useEffect(() => {
    if (isOpen && currentUserStories.length > 0) {
      const currentStory = currentUserStories[currentStoryIndex];
      if (currentStory) {
        // Import userService and track view
        import('@/services/userService').then(({ userService }) => {
          userService.trackStoryView(currentStory.id);
        });
      }
    }
  }, [currentStoryIndex, currentUserStories, isOpen]);

  const handleNextGroup = () => {
    if (currentGroupIndex < allGroupedStories.length - 1) {
      const nextGroupIndex = currentGroupIndex + 1;
      setCurrentGroupIndex(nextGroupIndex);
      setCurrentUserStories(allGroupedStories[nextGroupIndex].stories);
      setCurrentStoryIndex(0);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen || currentUserStories.length === 0) return;

    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNextStory(true);
          return 0;
        }
        return p + 2; // 5 seconds per story (100 / (2) = 50 intervals, 50 * 100ms = 5000ms = 5s)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex, isOpen, currentUserStories]);

  const handleNextStory = (fromTimer = false) => {
    if (currentStoryIndex < currentUserStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
        if(fromTimer) handleNextGroup();
        else onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentGroupIndex > 0) {
        const prevGroupIndex = currentGroupIndex - 1;
        setCurrentGroupIndex(prevGroupIndex);
        setCurrentUserStories(allGroupedStories[prevGroupIndex].stories);
        setCurrentStoryIndex(allGroupedStories[prevGroupIndex].stories.length - 1);
    }
  };

  if (!isOpen || currentUserStories.length === 0) return null;

  const story = currentUserStories[currentStoryIndex];
  const user = story.user as Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'> | undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-black border-0 max-w-md h-[90vh] flex flex-col" onPointerDown={onClose}>
        <div className="absolute top-2 left-2 right-2 z-10 space-y-1">
          <div className="flex gap-1">
            {currentUserStories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-500/50 rounded-full">
                <div 
                  className="h-1 bg-white rounded-full transition-all duration-100 linear" 
                  style={{ width: `${index < currentStoryIndex ? 100 : (index === currentStoryIndex ? progress : 0)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile_picture_url || undefined} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold text-sm">{user?.name}</span>
                <p className="text-xs opacity-75">
                  {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Eye className="h-3 w-3" />
              <span>{story.view_count}</span>
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="absolute top-2 right-2 z-20 text-white p-2">
            <X />
        </button>

        <img src={story.media_url} alt={story.caption || 'Story'} className="w-full h-full object-contain" />
        
        {story.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-center">{story.caption}</p>
          </div>
        )}

        <button onClick={(e) => {e.stopPropagation(); handlePrevStory();}} className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1/2 text-white">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1"><ChevronLeft size={24} /></div>
        </button>
        <button onClick={(e) => {e.stopPropagation(); handleNextStory();}} className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/2 text-white">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-1"><ChevronRight size={24} /></div>
        </button>

      </DialogContent>
    </Dialog>
  );
};
