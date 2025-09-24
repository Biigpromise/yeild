import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  
  const email = searchParams.get('email') || '';

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('Email address not found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    try {
      // Use our custom verification code function
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email, 
          type: 'signup' 
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.message || 'Failed to send verification code');
      }

      toast.success('Verification code sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(`Failed to resend verification code: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              We've sent a confirmation email to:
            </p>
            <p className="font-semibold text-foreground">{email}</p>
            <p className="text-sm text-muted-foreground">
              We've sent a verification code to your email address. Enter the 6-digit code below to complete your account setup.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;