import React from 'react';
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';

export const SocialTab: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Stories Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Stories</h2>
          <StoriesBar />
        </div>
        
        {/* Social Hub */}
        <SocialHub />
      </div>
    </div>
  );
};