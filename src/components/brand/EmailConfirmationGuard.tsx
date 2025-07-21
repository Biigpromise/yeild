
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailConfirmationGuardProps {
  children: React.ReactNode;
}

export const EmailConfirmationGuard: React.FC<EmailConfirmationGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('brand_applications')
          .select('email_confirmed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking email confirmation:', error);
          setEmailConfirmed(false);
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
      // Only resend if really necessary - this should be rare since email is sent once during signup
      const { error } = await supabase.functions.invoke('send-brand-confirmation-email', {
        body: {
          email: user.email,
          companyName: user.user_metadata.company_name || 'Brand User'
        }
      });

      if (error) {
        toast.error('Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('An error occurred while resending the email');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!emailConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Confirm Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent a confirmation email to <strong>{user?.email}</strong>. 
              Please check your inbox and click the confirmation link to access your brand dashboard.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleResendConfirmation} 
                disabled={resending}
                className="w-full"
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
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or click resend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
