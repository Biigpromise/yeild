import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<'sending' | 'sent' | 'error' | null>(null);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setDeliveryStatus('sending');
    
    try {
      const { error } = await resetPassword(email);

      if (error) {
        setDeliveryStatus('error');
        toast.error(error.message);
      } else {
        setDeliveryStatus('sent');
        toast.success("Verification code sent! Check your inbox.");
        // Navigate to code verification page
        navigate(`/verify-reset-code?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setDeliveryStatus('error');
      toast.error("An unexpected error occurred while sending reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/auth')}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img 
              src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
              alt="YEILD Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl text-foreground">
              {emailSent ? 'Check your email' : 'Reset your password'}
            </CardTitle>
            {!emailSent && (
              <p className="text-muted-foreground text-sm mt-2">
                Enter your email and we'll send you a 6-digit verification code
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {emailSent ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-foreground">
                  We've sent a verification code to
                </p>
                <p className="font-medium text-foreground">{email}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, check your spam folder.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-input border-border text-foreground pl-10 py-3 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 font-medium"
              >
                {isLoading ? "Sending..." : "Send verification code"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
