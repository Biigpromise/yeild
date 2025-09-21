import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';
import { Users, Clock, Sparkles } from 'lucide-react';

export const SocialTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Bird Status Display */}
      <BirdStatusDisplay />
      
      {/* Coming Soon Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Social Features
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Social Hub Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md">
                We're building amazing social features including community feeds, user connections, and interactive content sharing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};