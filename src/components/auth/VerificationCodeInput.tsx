
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface VerificationCodeInputProps {
  email: string;
  type: 'signup' | 'signin';
  onVerified: (token: string) => void;
  onBack: () => void;
  onResend: () => void;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  email,
  type,
  onVerified,
  onBack,
  onResend
}) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [lastAttemptCode, setLastAttemptCode] = useState<string>('');

  const parseErrorMessage = (error: any): string => {
    console.error('Parsing error:', error);
    
    // Handle network errors
    if (!error) {
      return 'An unexpected error occurred. Please try again.';
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      if (error.includes('Edge Function returned a non-2xx status code')) {
        return 'Verification failed. Please check your code and try again.';
      }
      if (error.includes('failed to send a request')) {
        return 'Network error. Please check your connection and try again.';
      }
      return error;
    }
    
    // Handle error objects with message
    if (error.message) {
      const message = error.message;
      
      // Network/connection errors
      if (message.includes('fetch') || message.includes('network') || message.includes('failed to send')) {
        return 'Network error. Please check your connection and try again.';
      }
      
      // Edge function errors
      if (message.includes('Edge Function returned a non-2xx status code')) {
        return 'Verification service unavailable. Please try again in a moment.';
      }
      
      return message;
    }
    
    // Handle error objects with details
    if (error.details) {
      return error.details;
    }
    
    return 'Verification failed. Please try again.';
  };

  const handleVerifyCode = useCallback(async () => {
    if (code.length !== 6) {
      setValidationError('Please enter a complete 6-digit code');
      return;
    }
    
    if (code === lastAttemptCode) {
      setValidationError('You just tried this code. Please check your email for the correct code.');
      return;
    }

    setIsVerifying(true);
    setValidationError('');
    setLastAttemptCode(code);

    try {
      console.log('Starting verification process for:', email, 'type:', type);
      
      const response = await supabase.functions.invoke('verify-signup-code', {
        body: { 
          email, 
          code, 
          type 
        }
      });

      console.log('Raw verification response:', response);

      // Handle function invocation errors (network, deployment, etc.)
      if (response.error) {
        console.error('Function invocation error:', response.error);
        
        const errorMessage = parseErrorMessage(response.error);
        toast.error(errorMessage);
        setValidationError(errorMessage);
        return;
      }

      const { data } = response;
      console.log('Verification response data:', data);
      
      if (data?.success) {
        // Handle already verified codes that return success
        if (data.alreadyVerified) {
          toast.success('Already verified! Signing you in...');
        } else {
          toast.success(data.message || 'Code verified successfully!');
        }
        
        // Handle magic link for signin
        if (data.magicLink && type === 'signin') {
          console.log('Attempting magic link redirect...');
          try {
            // Give user feedback before redirect
            toast.success('Verified! Redirecting to dashboard...');
            
            // Small delay to show the toast, then redirect
            setTimeout(() => {
              window.location.href = data.magicLink;
            }, 1500);
            
            return;
          } catch (linkError) {
            console.error('Magic link redirect failed:', linkError);
            toast.warning('Verification successful, but redirect failed. Please try signing in again.');
            // Fallback: call onVerified to continue with normal flow
            onVerified(data.token);
          }
        }
        
        // For signup or signin without magic link
        onVerified(data.token);
      } else {
        // Handle API errors with specific messaging
        const errorMessage = data?.error || 'Unknown error occurred';
        console.error('Verification failed:', errorMessage);
        
        let userFriendlyMessage = errorMessage;
        
        if (errorMessage.includes('expired')) {
          userFriendlyMessage = 'Verification code has expired. Please request a new one.';
        } else if (errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
          userFriendlyMessage = 'Invalid verification code. Please check and try again.';
        } else if (errorMessage.includes('too many attempts') || errorMessage.includes('Too many')) {
          userFriendlyMessage = 'Too many attempts. Please request a new verification code.';
        } else if (errorMessage.includes('already been used') || errorMessage.includes('already used')) {
          userFriendlyMessage = 'This code has already been used. Please request a new one.';
        } else if (errorMessage.includes('not found')) {
          userFriendlyMessage = 'Verification code not found. Please request a new one.';
        } else if (errorMessage.includes('Database error') || errorMessage.includes('Server configuration')) {
          userFriendlyMessage = 'Service temporarily unavailable. Please try again in a moment.';
        }
        
        toast.error(userFriendlyMessage);
        setValidationError(userFriendlyMessage);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      
      const errorMessage = parseErrorMessage(error);
      toast.error(errorMessage);
      setValidationError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, [code, email, type, onVerified, lastAttemptCode]);

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    setValidationError('');
    try {
      await onResend();
      setCode(''); // Clear the current code
      setLastAttemptCode(''); // Reset last attempt tracking
      toast.success('New verification code sent! Please check your email.');
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [onResend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Enter Verification Code</h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => {
                setCode(value);
                setValidationError('');
                // Clear validation error when user starts typing
                if (value !== lastAttemptCode) {
                  setValidationError('');
                }
              }}
              onComplete={handleVerifyCode}
              className={validationError ? 'border-destructive' : ''}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="w-4 h-4" />
              {validationError}
            </motion.div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          onClick={handleVerifyCode}
          disabled={code.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify Code'}
        </Button>

        <div className="flex justify-between items-center text-sm">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {isResending ? 'Sending...' : 'Resend code'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
