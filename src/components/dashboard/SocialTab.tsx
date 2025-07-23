
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirdStatusDisplay } from '@/components/bird/BirdStatusDisplay';

// Lazy load components to avoid potential loading issues
const SocialHub = React.lazy(() => import('@/components/social/SocialHub').then(module => ({ default: module.SocialHub })));
const StoriesBar = React.lazy(() => import('@/components/social/StoriesBar').then(module => ({ default: module.StoriesBar })));

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

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading social features...</p>
    </div>
  </div>
);

export const SocialTab: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Bird Status Display - Full width, no padding */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="flex-shrink-0">
          <BirdStatusDisplay />
        </div>
      </ErrorBoundary>
      
      {/* Stories Section - Full width with minimal padding */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="flex-shrink-0 px-2 md:px-4 py-2 md:py-4">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-4 text-foreground">Stories</h2>
          <React.Suspense fallback={<LoadingFallback />}>
            <StoriesBar />
          </React.Suspense>
        </div>
      </ErrorBoundary>
      
      {/* Social Hub - Takes remaining space, no additional padding */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="flex-1 min-h-0 overflow-hidden">
          <React.Suspense fallback={<LoadingFallback />}>
            <SocialHub />
          </React.Suspense>
        </div>
      </ErrorBoundary>
    </div>
  );
};
