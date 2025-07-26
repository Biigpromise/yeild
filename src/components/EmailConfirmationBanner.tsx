
import React, { useState } from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const EmailConfirmationBanner: React.FC = () => {
  const { user, resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user's email is confirmed or banner is dismissed
  if (user?.email_confirmed_at || isDismissed) {
    return null;
  }

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await resendConfirmation(user.email);
      if (!error) {
        toast.success('Confirmation email sent! Please check your inbox.');
      } else {
        toast.error('Failed to resend confirmation email.');
      }
    } catch (error) {
      toast.error('An error occurred while resending the email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 relative">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Email Verification Required</p>
            <p className="text-sm text-yellow-100">
              Please verify your email address to access all features. Check your inbox for the confirmation email.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleResendConfirmation}
            disabled={isResending}
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Mail className="h-4 w-4 mr-1" />
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            onClick={() => setIsDismissed(true)}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
