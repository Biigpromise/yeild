
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';

// Import components directly to avoid lazy loading issues
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';
import { UpcomingTasksTab } from '@/components/social/UpcomingTasksTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityChatTab } from '@/components/dashboard/CommunityChatTab';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="p-6">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Something went wrong loading the social features. Please try refreshing.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
          className="ml-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

export const SocialTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Bird Status Display */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <BirdStatusDisplay />
      </ErrorBoundary>
      
      <Tabs defaultValue="community" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="community">Community Chat</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="community" className="mt-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <CommunityChatTab />
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <UpcomingTasksTab />
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="stories" className="mt-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div>
              <h2 className="text-lg font-semibold mb-4 text-foreground">Stories</h2>
              <StoriesBar />
            </div>
          </ErrorBoundary>
        </TabsContent>
        
        <TabsContent value="feed" className="mt-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SocialHub />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};
