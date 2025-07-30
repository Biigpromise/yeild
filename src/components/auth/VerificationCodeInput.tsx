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
      const response = await supabase.functions.invoke('verify-signup-code', {
        body: { 
          email, 
          code, 
          type 
        }
      });

      console.log('Verification response:', response);

      // Handle function invocation errors
      if (response.error) {
        console.error('Function invocation error:', response.error);
        
        // Try to extract meaningful error from the response
        let errorMessage = 'Verification failed. Please try again.';
        
        if (response.error.message) {
          const message = response.error.message;
          if (message.includes('Edge Function returned a non-2xx status code')) {
            errorMessage = 'Invalid or expired verification code. Please request a new one.';
          } else {
            errorMessage = message;
          }
        }
        
        toast.error(errorMessage);
        setValidationError(errorMessage);
        return;
      }

      const { data } = response;
      
      if (data?.success) {
        // Handle already verified codes that return success
        if (data.alreadyVerified) {
          toast.success('Already verified! Signing you in...');
        } else {
          toast.success(data.message || 'Code verified successfully!');
        }
        
        // Handle magic link for signin
        if (data.magicLink && type === 'signin') {
          try {
            setTimeout(() => {
              window.location.href = data.magicLink;
            }, 1000);
          } catch (linkError) {
            console.error('Magic link redirect failed:', linkError);
            // Fallback: call onVerified to continue with normal flow
            onVerified(data.token);
          }
          return;
        }
        
        onVerified(data.token);
      } else {
        // Handle API errors with specific messaging
        const errorMessage = data?.error || 'Unknown error occurred';
        
        if (errorMessage.includes('expired')) {
          toast.error('Verification code has expired. Please request a new one.');
        } else if (errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
          toast.error('Invalid verification code. Please check and try again.');
        } else if (errorMessage.includes('too many attempts')) {
          toast.error('Too many attempts. Please request a new verification code.');
        } else if (errorMessage.includes('already been used') || errorMessage.includes('already used')) {
          toast.error('This code has already been used. Please request a new one.');
        } else if (errorMessage.includes('not found')) {
          toast.error('Verification code not found. Please request a new one.');
        } else {
          toast.error(errorMessage);
        }
        
        setValidationError(errorMessage);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      
      // Handle network and other errors
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
        setValidationError('Network error occurred');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        setValidationError('An unexpected error occurred');
      }
    } finally {
      setIsVerifying(false);
    }
  }, [code, email, type, onVerified]);

  const handleResendCode = useCallback(async () => {
    setIsResending(true);
    try {
      await onResend();
      setCode(''); // Clear the current code
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