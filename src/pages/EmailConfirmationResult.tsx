import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailConfirmationResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Invalid confirmation link.');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) {
          throw error;
        }

        setStatus('success');
        setMessage('Your email has been confirmed successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email.');
      }
    };

    handleConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'loading' && (
              <div className="bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-500/10">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-500/10">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirming Email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard in 3 seconds...
            </p>
          )}

          {status !== 'loading' && (
            <Button
              onClick={() => navigate(status === 'success' ? '/dashboard' : '/login')}
              className="w-full"
            >
              {status === 'success' ? 'Go to Dashboard' : 'Back to Login'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmationResult;