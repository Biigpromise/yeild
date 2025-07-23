
import React from 'react';
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';

export const SocialTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Bird Status Display - Full width, no padding */}
      <div className="flex-shrink-0">
        <BirdStatusDisplay />
      </div>
      
      {/* Stories Section - Full width */}
      <div className="flex-shrink-0 px-4 py-4">
        <h2 className="text-lg font-semibold mb-4 text-white">Stories</h2>
        <StoriesBar />
      </div>
      
      {/* Social Hub - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <SocialHub />
      </div>
    </div>
  );
};
