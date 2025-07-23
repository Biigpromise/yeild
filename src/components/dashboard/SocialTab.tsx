
import React from 'react';
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';

export const SocialTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Bird Status Display - Full width, no padding */}
      <div className="flex-shrink-0">
        <BirdStatusDisplay />
      </div>
      
      {/* Stories Section - Full width with minimal padding */}
      <div className="flex-shrink-0 px-2 md:px-4 py-2 md:py-4">
        <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-foreground">Stories</h2>
        <StoriesBar />
      </div>
      
      {/* Social Hub - Takes remaining space, no additional padding */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SocialHub />
      </div>
    </div>
  );
};
