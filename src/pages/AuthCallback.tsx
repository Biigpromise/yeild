import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Check URL parameters for OAuth context
          const userType = searchParams.get('user_type') || data.session.user.user_metadata?.user_type;
          
          // For brand OAuth users, ensure proper role assignment
          if (userType === 'brand') {
            try {
              // Ensure brand role is assigned
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', data.session.user.id)
                .eq('role', 'brand')
                .single();

              if (!roleData) {
                await supabase
                  .from('user_roles')
                  .insert({
                    user_id: data.session.user.id,
                    role: 'brand'
                  });
              }

              // Create brand profile if doesn't exist
              const { data: brandProfile } = await supabase
                .from('brand_profiles')
                .select('id')
                .eq('user_id', data.session.user.id)
                .single();

              if (!brandProfile) {
                await supabase
                  .from('brand_profiles')
                  .insert({
                    user_id: data.session.user.id,
                    company_name: data.session.user.user_metadata?.name || 'Brand User',
                    industry: 'Other'
                  });
              }
            } catch (error) {
              console.error('Error setting up brand user:', error);
            }
          }
          
          setTimeout(() => {
            if (userType === 'brand') {
              navigate('/brand-dashboard');
            } else if (data.session.user.email === 'yeildsocials@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          // Try to handle the auth callback
          const { error: callbackError } = await supabase.auth.getUser();
          
          if (callbackError) {
            throw callbackError;
          }
          
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting...');
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed. Please try again.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'loading' && (
              <div className="bg-primary/10 rounded-full p-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="bg-green-500/10 rounded-full p-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-500/10 rounded-full p-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Error'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;