
import React from 'react';
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';

export const SocialTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Bird Status Display */}
      <BirdStatusDisplay />
      
      {/* Stories Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Stories</h2>
        <StoriesBar />
      </div>
      
      {/* Social Hub */}
      <SocialHub />
    </div>
  );
};
