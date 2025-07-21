
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface EmailConfirmationRequiredProps {
  email: string;
  userType?: string;
}

export const EmailConfirmationRequired: React.FC<EmailConfirmationRequiredProps> = ({ 
  email, 
  userType = 'user' 
}) => {
  const [isResending, setIsResending] = useState(false);
  const { resendConfirmation } = useAuth();

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const { error } = await resendConfirmation(email);
      if (error) {
        toast.error(error.message || 'Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Confirm Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              We've sent a confirmation email to:
            </p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Check your email inbox</li>
                  <li>Click the confirmation link</li>
                  <li>Return here to access your {userType === 'brand' ? 'brand dashboard' : 'dashboard'}</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendConfirmation} 
              disabled={isResending}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Confirmation Email'
              )}
            </Button>
            
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
