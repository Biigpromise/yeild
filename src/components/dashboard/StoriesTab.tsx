
import React from 'react';
import { StoryReel } from '@/components/stories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StoriesTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stories</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <StoryReel />
        </CardContent>
      </Card>
    </div>
  );
};
