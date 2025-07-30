import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function VerifySignupCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startOnboarding, setUserType } = useOnboarding();
  
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const userType = searchParams.get('userType') || 'user';

  if (!email) {
    navigate('/auth');
    return null;
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying signup code for:', email);
      
      // First verify the code
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-signup-code', {
        body: { 
          email, 
          code,
          type: 'signup'
        }
      });

      if (verifyError) {
        console.error('Code verification error:', verifyError);
        toast.error(verifyError.message || 'Invalid or expired code');
        return;
      }

      if (!verifyData.success) {
        toast.error('Invalid or expired code');
        return;
      }

      // Get password from URL parameters (stored temporarily)
      const password = searchParams.get('password');
      if (!password) {
        toast.error('Session expired. Please try signing up again.');
        navigate('/auth');
        return;
      }

      console.log('Code verified, creating account...');
      
      // Create account using our custom edge function (bypasses email confirmation issues)
      const { data: createUserData, error: createUserError } = await supabase.functions.invoke('create-verified-user', {
        body: {
          email,
          password,
          name,
          userType,
          codeId: verifyData.codeId
        }
      });

      if (createUserError) {
        console.error('Account creation error:', createUserError);
        toast.error(createUserError.message || 'Failed to create account');
        return;
      }

      if (!createUserData.success) {
        console.error('Account creation failed:', createUserData.message);
        toast.error(createUserData.message || 'Failed to create account');
        return;
      }

      console.log('Account created successfully:', createUserData);
      
      toast.success('Account created successfully!');

      // Show onboarding after successful account creation
      setUserType(userType as 'user' | 'brand');
      startOnboarding();
      
      // Navigate to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Verification catch error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email,
          type: 'signup'
        }
      });

      if (error) {
        toast.error('Failed to resend code');
      } else {
        toast.success('New code sent to your email');
        setCode('');
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to {email}. Enter it below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
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

          <Button 
            onClick={handleVerifyCode} 
            disabled={loading || code.length !== 6}
            className="w-full"
          >
            {loading ? 'Creating Account...' : 'Verify & Create Account'}
          </Button>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={resending}
              className="w-full"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}