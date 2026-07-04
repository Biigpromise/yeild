import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function VerifySignupCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const userType = searchParams.get('userType') || 'user';
  const normalizedEmail = email?.trim().toLowerCase() || '';
  const storedPendingSignup = normalizedEmail
    ? sessionStorage.getItem(`pendingSignup:${normalizedEmail}`)
    : null;
  const pendingSignup = (location.state as any)?.pendingSignup || (() => {
    if (!storedPendingSignup) return null;
    try {
      return JSON.parse(storedPendingSignup);
    } catch (_) {
      sessionStorage.removeItem(`pendingSignup:${normalizedEmail}`);
      return null;
    }
  })();

  const getFunctionErrorMessage = async (error: any, fallback: string) => {
    try {
      const body = await error?.context?.json?.();
      return body?.error || body?.message || fallback;
    } catch (_) {
      return error?.message || fallback;
    }
  };

  const proceedToDashboard = async (verifyData: any) => {
    const targetUserType = pendingSignup?.userType || userType;
    const destination = verifyData?.redirectPath || (targetUserType === 'brand' ? '/brand-dashboard' : '/dashboard');

    if (pendingSignup?.password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail || email.trim().toLowerCase(),
        password: pendingSignup.password,
      });

      if (!signInError) {
        navigate(destination, { replace: true });
        return;
      }

      console.error('Post-verification sign-in failed:', signInError);
    }

    if (verifyData?.magicLink) {
      window.location.assign(verifyData.magicLink);
      return;
    }

    navigate('/auth', { replace: true });
  };

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/auth');
    }
  }, [email, navigate]);

  if (!email) {
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
      const normalizedEmail = email.trim().toLowerCase();
      
      // Verify the code and confirm the user's email
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-signup-code', {
        body: { 
          email, 
          code,
          type: 'signup',
          password: pendingSignup?.password,
          name: pendingSignup?.name || name,
          userType: pendingSignup?.userType || userType,
          userData: pendingSignup?.userData
        }
      });

      if (verifyError) {
        console.error('Code verification error:', verifyError);
        const errorMessage = await getFunctionErrorMessage(verifyError, 'Invalid or expired code');
        toast.error(errorMessage);
        return;
      }

      if (!verifyData.success) {
        toast.error(verifyData.error || 'Invalid or expired code');
        return;
      }

      console.log('Email verified successfully!', verifyData);
      sessionStorage.removeItem(`pendingSignup:${normalizedEmail}`);
      toast.success('Email verified! Signing you in...');
      await proceedToDashboard(verifyData);

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