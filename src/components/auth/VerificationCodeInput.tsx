import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

      if (error) throw error;

      if (data.success) {
        toast.success('Code verified successfully!');
        
        // For signin with magic link
        if (type === 'signin' && data.magicLink) {
          window.location.href = data.magicLink;
          return;
        }
        
        onVerified(data.token);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify code');
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
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            onComplete={handleVerifyCode}
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

        <div className="text-center text-sm text-muted-foreground">
          Enter the code that was sent to your email
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