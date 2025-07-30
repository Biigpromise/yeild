import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="space-y-3">
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetErrorBoundary}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback = ErrorFallback 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }}
      onReset={() => {
        // Optionally reload the page or reset some state
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};