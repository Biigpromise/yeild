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
      toast.error('Please enter a complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-signup-code', {
        body: { email, code, type }
      });

      // Handle edge function errors
      if (error) {
        console.error('Edge function error:', error);
        setLastAttemptCode(code);
        
        if (error.message.includes('not found or expired')) {
          setValidationError('Code expired or invalid');
          toast.error('Verification code has expired or is invalid. Please request a new code.');
        } else if (error.message.includes('attempt limit')) {
          setValidationError('Too many attempts');
          toast.error('Too many attempts. Please request a new verification code.');
        } else {
          setValidationError('Verification failed');
          toast.error('Failed to verify code. Please try again or request a new code.');
        }
        return;
      }

      // Handle successful response
      if (data?.success) {
        toast.success('Code verified successfully!');
        
        // For signin with magic link
        if (type === 'signin' && data.magicLink) {
          window.location.href = data.magicLink;
          return;
        }
        
        onVerified(data.token);
      } else {
        // Handle API errors with specific messages
        setLastAttemptCode(code);
        const errorMessage = data?.error || 'Invalid verification code';
        
        if (errorMessage.includes('expired')) {
          setValidationError('Code expired');
          toast.error('Verification code has expired. Please request a new code.');
        } else if (errorMessage.includes('attempt')) {
          setValidationError('Too many attempts');
          toast.error('Too many failed attempts. Please request a new verification code.');
        } else {
          setValidationError('Invalid code');
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setLastAttemptCode(code);
      
      // More specific error handling
      if (error.message.includes('fetch')) {
        setValidationError('Network error');
        toast.error('Network error. Please check your connection and try again.');
      } else {
        setValidationError('Verification failed');
        toast.error('An unexpected error occurred. Please try again.');
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