import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function CreateNewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    navigate('/forgot-password');
    return null;
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', check: password.length >= 8 },
    { label: 'Contains uppercase letter', check: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', check: /[a-z]/.test(password) },
    { label: 'Contains number', check: /\d/.test(password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.check);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleUpdatePassword = async () => {
    if (!isPasswordValid) {
      toast.error('Please ensure your password meets all requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { token, password, email }
      });

      if (error) {
        toast.error(error.message || 'Failed to update password');
        return;
      }

      if (data.success) {
        toast.success('Password updated successfully!');
        navigate('/auth', { replace: true });
      } else {
        toast.error('Failed to update password. Please try again.');
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
          <CardDescription>
            Enter your new password for {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {password && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Password Requirements</Label>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle 
                      className={`h-4 w-4 ${req.check ? 'text-green-500' : 'text-muted-foreground'}`}
                    />
                    <span className={req.check ? 'text-green-600' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button 
            onClick={handleUpdatePassword} 
            disabled={loading || !isPasswordValid || !passwordsMatch}
            className="w-full"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}