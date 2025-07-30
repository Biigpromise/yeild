
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CustomResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      console.log('=== CUSTOM RESET PASSWORD DEBUG ===');
      console.log('Current URL:', window.location.href);
      console.log('Token from URL:', token);
      console.log('All search params:', Object.fromEntries(searchParams.entries()));
      
      if (!token) {
        console.log('ERROR: No token provided in URL');
        toast.error('Invalid reset link - no token found');
        setValidatingToken(false);
        setTokenValid(false);
        return;
      }

      try {
        console.log('Validating token in database...');
        
        // Check if token exists and is not expired
        const { data: tokenData, error } = await supabase
          .from('password_reset_tokens')
          .select('user_id, email, expires_at, used_at, created_at')
          .eq('token', token)
          .single();

        console.log('Token validation result:', { tokenData, error });

        if (error) {
          console.error('Token validation error:', error);
          if (error.code === 'PGRST116') {
            toast.error('Invalid reset link - token not found');
          } else {
            toast.error('Error validating reset link');
          }
          setTokenValid(false);
          setValidatingToken(false);
          return;
        }

        if (!tokenData) {
          console.log('ERROR: No token data returned');
          toast.error('Invalid reset link - no data found');
          setTokenValid(false);
          setValidatingToken(false);
          return;
        }

        // Check if token is expired
        const now = new Date();
        const expiresAt = new Date(tokenData.expires_at);
        
        console.log('Token expiry check:', {
          now: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isExpired: now > expiresAt
        });
        
        if (now > expiresAt) {
          console.log('ERROR: Token is expired');
          toast.error('Reset link has expired');
          setTokenValid(false);
          setValidatingToken(false);
          return;
        }

        // Check if token has already been used
        if (tokenData.used_at) {
          console.log('ERROR: Token has already been used');
          toast.error('Reset link has already been used');
          setTokenValid(false);
          setValidatingToken(false);
          return;
        }

        console.log('SUCCESS: Token is valid');
        setTokenValid(true);
        setEmail(tokenData.email);
        setUserId(tokenData.user_id);
        setValidatingToken(false);
        
      } catch (error) {
        console.error('Token validation unexpected error:', error);
        toast.error('Error validating reset link');
        setTokenValid(false);
        setValidatingToken(false);
      }
    };

    // Add a small delay to ensure the component is mounted
    const timeoutId = setTimeout(validateToken, 100);
    return () => clearTimeout(timeoutId);
  }, [token, searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to update password for user:', userId);

      const { data, error: updateError } = await supabase.functions.invoke('update-user-password', {
        body: { 
          userId: userId,
          password: password,
          token: token
        }
      });

      console.log('Password update response:', { data, updateError });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast.error("Failed to update password. Please try again.");
        return;
      }

      if (data?.error) {
        console.error('Password update service error:', data.error);
        toast.error(data.error || "Failed to update password. Please try again.");
        return;
      }

      console.log('Password updated successfully');
      toast.success("Password updated successfully!");
      setPasswordChanged(true);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = async () => {
    if (!email) {
      toast.error("Unable to determine email address");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { email }
      });

      if (error) {
        toast.error("Failed to send new reset link");
      } else {
        toast.success("New password reset link sent to your email");
      }
    } catch (error) {
      console.error('Request new link error:', error);
      toast.error("Failed to send new reset link");
    }
  };

  // Prevent navigation away from this page during token validation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (validatingToken || (tokenValid && !passwordChanged)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [validatingToken, tokenValid, passwordChanged]);

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Verifying reset link...</p>
            <p className="text-xs text-muted-foreground mt-2">Token: {token?.substring(0, 10)}...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/forgot-password')}
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
              <CardTitle className="text-2xl text-foreground">Invalid Reset Link</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                This password reset link is invalid, expired, or has already been used.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              
              <Button
                onClick={handleRequestNewLink}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
              >
                Request New Reset Link
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/forgot-password')}
                className="w-full py-3"
              >
                Back to Forgot Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordChanged) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
                alt="YEILD Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground">Password Changed</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Your password has been successfully updated
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 font-medium"
            >
              Continue to YEILD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/forgot-password')}
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
            <CardTitle className="text-2xl text-foreground">Set New Password</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your new password for {email}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border-border text-foreground pr-10 py-3 focus:border-primary focus:ring-primary"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-input border-border text-foreground pr-10 py-3 focus:border-primary focus:ring-primary"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 font-medium"
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Forgot Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomResetPassword;
