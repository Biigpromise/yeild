import React from 'react';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthErrorHandlerProps {
  error: string;
  onRetry?: () => void;
  onResendEmail?: () => void;
  email?: string;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ 
  error, 
  onRetry, 
  onResendEmail, 
  email 
}) => {
  // Common auth error patterns and their user-friendly messages
  const getErrorMessage = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('user already registered') || lowerError.includes('already been registered')) {
      return {
        title: 'Account Already Exists',
        message: 'An account with this email already exists. Try signing in instead.',
        actionType: 'signin' as const
      };
    }
    
    if (lowerError.includes('invalid login credentials') || lowerError.includes('invalid email or password')) {
      return {
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect. Please check and try again.',
        actionType: 'retry' as const
      };
    }
    
    if (lowerError.includes('email not confirmed') || lowerError.includes('email confirmation')) {
      return {
        title: 'Email Not Confirmed',
        message: 'Please check your email and click the confirmation link to activate your account.',
        actionType: 'resend' as const
      };
    }
    
    if (lowerError.includes('password')) {
      return {
        title: 'Password Issue',
        message: 'Password must be at least 8 characters long and contain a mix of letters and numbers.',
        actionType: 'retry' as const
      };
    }
    
    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        actionType: 'retry' as const
      };
    }
    
    if (lowerError.includes('rate limit') || lowerError.includes('too many')) {
      return {
        title: 'Too Many Attempts',
        message: 'You\'ve made too many requests. Please wait a few minutes and try again.',
        actionType: null
      };
    }
    
    // Default fallback
    return {
      title: 'Something Went Wrong',
      message: errorMessage || 'An unexpected error occurred. Please try again.',
      actionType: 'retry' as const
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-semibold">{errorInfo.title}</p>
            <p className="text-sm mt-1">{errorInfo.message}</p>
          </div>
          
          <div className="flex gap-2">
            {errorInfo.actionType === 'retry' && onRetry && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRetry}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
            
            {errorInfo.actionType === 'resend' && onResendEmail && email && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onResendEmail}
                className="text-xs"
              >
                <Mail className="h-3 w-3 mr-1" />
                Resend Email
              </Button>
            )}
            
            {errorInfo.actionType === 'signin' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/login'}
                className="text-xs"
              >
                Go to Sign In
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};