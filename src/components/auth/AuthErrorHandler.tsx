import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
  showEmailSupport?: boolean;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({
  error,
  onRetry,
  onClearError,
  showEmailSupport = false
}) => {
  if (!error) return null;

  const getErrorDetails = (errorMessage: string) => {
    if (errorMessage.includes('invalid_credentials')) {
      return {
        title: 'Invalid credentials',
        description: 'Please check your email and password and try again.',
        severity: 'warning' as const,
        action: 'retry'
      };
    }
    
    if (errorMessage.includes('email_not_confirmed')) {
      return {
        title: 'Email not confirmed',
        description: 'Please check your email and click the confirmation link.',
        severity: 'info' as const,
        action: 'email'
      };
    }
    
    if (errorMessage.includes('too_many_requests')) {
      return {
        title: 'Too many attempts',
        description: 'Please wait a few minutes before trying again.',
        severity: 'warning' as const,
        action: 'wait'
      };
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: 'Connection issue',
        description: 'Please check your internet connection and try again.',
        severity: 'error' as const,
        action: 'retry'
      };
    }

    return {
      title: 'Authentication error',
      description: errorMessage.length > 100 ? 'An unexpected error occurred. Please try again.' : errorMessage,
      severity: 'error' as const,
      action: 'retry'
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <Alert variant={errorDetails.severity === 'info' ? 'default' : 'destructive'} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium">{errorDetails.title}</p>
          <p className="text-sm opacity-90">{errorDetails.description}</p>
        </div>
        
        <div className="flex gap-2">
          {errorDetails.action === 'retry' && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {errorDetails.action === 'email' && showEmailSupport && (
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@yeildsocials.com">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          )}
          
          {onClearError && (
            <Button variant="ghost" size="sm" onClick={onClearError}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};