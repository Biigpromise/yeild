
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface EmailConfirmationGuardProps {
  children: React.ReactNode;
}

export const EmailConfirmationGuard: React.FC<EmailConfirmationGuardProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!user) return;

      try {
        console.log('Checking email confirmation for user:', user.id);
        
        // Check localStorage for skip preference first
        const skipKey = `email_confirmation_skipped_${user.id}`;
        const hasSkipped = localStorage.getItem(skipKey) === 'true';
        
        if (hasSkipped) {
          console.log('User has previously skipped email confirmation');
          setEmailConfirmed(true);
          setLoading(false);
          return;
        }

        // Check if email is confirmed by Supabase auth
        if (user.email_confirmed_at) {
          console.log('Email confirmed by Supabase auth');
          setEmailConfirmed(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('brand_applications')
          .select('email_confirmed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking email confirmation:', error);
          // If no brand application exists, create one for existing brand users
          if (error.code === 'PGRST116') {
            try {
              console.log('Creating brand application for existing user');
              await supabase
                .from('brand_applications')
                .insert({
                  user_id: user.id,
                  company_name: user.user_metadata?.company_name || user.user_metadata?.name || 'Brand User',
                  website: user.user_metadata?.website || '',
                  industry: user.user_metadata?.industry || 'Other',
                  company_size: user.user_metadata?.company_size || '1-10',
                  task_types: user.user_metadata?.task_types || [],
                  budget: user.user_metadata?.budget || '$1,000 - $5,000',
                  goals: user.user_metadata?.goals || 'Brand promotion',
                  email_confirmed: !!user.email_confirmed_at
                });
              
              setEmailConfirmed(!!user.email_confirmed_at);
            } catch (insertError) {
              console.error('Error creating brand application:', insertError);
              setEmailConfirmed(false);
            }
          } else {
            setEmailConfirmed(false);
          }
        } else {
          setEmailConfirmed(data?.email_confirmed || false);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setEmailConfirmed(false);
      } finally {
        setLoading(false);
      }
    };

    checkEmailConfirmation();
  }, [user]);

  const handleResendConfirmation = async () => {
    if (!user) return;
    
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke('send-brand-confirmation-email', {
        body: {
          email: user.email,
          companyName: user.user_metadata?.company_name || user.user_metadata?.name || 'Brand User'
        }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast.error('Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Error resending confirmation:', error);
      toast.error('An error occurred while resending the email');
    } finally {
      setResending(false);
    }
  };

  const handleGoBack = async () => {
    try {
      console.log('User going back from email confirmation');
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/auth');
    }
  };

  const handleSkipForNow = () => {
    if (!user) return;
    
    console.log('User skipping email confirmation');
    
    // Store skip preference in localStorage
    const skipKey = `email_confirmation_skipped_${user.id}`;
    localStorage.setItem(skipKey, 'true');
    
    // Allow user to proceed without email confirmation
    setEmailConfirmed(true);
    toast.info('You can confirm your email later from your profile settings.');
  };

  const handleTryAgain = () => {
    console.log('User trying email confirmation check again');
    setLoading(true);
    setEmailConfirmed(null);
    // Trigger the useEffect to check again
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  if (!emailConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="p-2 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <div className="w-8"></div>
            </div>
            <CardTitle className="text-xl text-white">Confirm Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              We've sent a confirmation email to <strong className="text-yeild-yellow">{user?.email}</strong>. 
              Please check your inbox and click the confirmation link to access your brand dashboard.
            </p>
            
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                <p className="text-sm text-yellow-200">
                  Don't see the email? Check your spam folder or try resending.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleResendConfirmation} 
                disabled={resending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Confirmation Email'
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleTryAgain}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Already Confirmed? Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleSkipForNow}
                className="w-full border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow/10"
              >
                Skip for Now
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                Having trouble? Contact support or try signing in again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
