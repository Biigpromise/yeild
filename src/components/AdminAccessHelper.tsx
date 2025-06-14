
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Settings, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { adminSetupService } from '@/services/admin/adminSetupService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminAccessHelper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('AdminAccessHelper: Checking admin access for user:', user.id, 'attempt:', checkAttempts + 1);
    
    try {
      const hasAccess = await adminSetupService.checkAdminAccess();
      console.log('AdminAccessHelper: Admin access result:', hasAccess);
      setHasAdminAccess(hasAccess);
      setCheckAttempts(prev => prev + 1);
    } catch (err) {
      console.error('AdminAccessHelper: Error checking admin access:', err);
      setError('Failed to check admin access. There may be a database configuration issue.');
      setCheckAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    setIsAssigning(true);
    setError(null);
    console.log('AdminAccessHelper: Making user admin:', user.id);
    
    try {
      const success = await adminSetupService.makeCurrentUserAdmin();
      console.log('AdminAccessHelper: Admin assignment result:', success);
      
      if (success) {
        setHasAdminAccess(true);
        setSuccess(true);
        console.log('AdminAccessHelper: Admin role assigned successfully');
      } else {
        setError('Failed to assign admin role. Please try refreshing and trying again.');
      }
    } catch (err) {
      console.error('AdminAccessHelper: Error assigning admin role:', err);
      setError('An error occurred while assigning admin role. This might be due to database configuration issues.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleGoToAdmin = () => {
    console.log('AdminAccessHelper: Navigating to admin dashboard with page reload');
    window.location.href = '/admin';
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Required
          </CardTitle>
          <CardDescription>
            You need to be logged in to access admin features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please log in first, then return to this page to set up admin access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking admin access...</span>
          </div>
          {checkAttempts > 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Attempt {checkAttempts}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (hasAdminAccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Admin Access Confirmed
          </CardTitle>
          <CardDescription>
            You have admin privileges and can access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Admin role assigned successfully! You can now access the admin dashboard.
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            className="w-full" 
            onClick={handleGoToAdmin}
          >
            <Settings className="h-4 w-4 mr-2" />
            Go to Admin Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={checkAdminAccess}
          >
            Refresh Admin Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Setup Admin Access
        </CardTitle>
        <CardDescription>
          You're logged in as {user.email}, but you don't have admin privileges yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {checkAttempts > 2 && !hasAdminAccess && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Having trouble checking admin access. This might be due to database configuration issues. 
              Try clicking "Make Me Admin" to assign the role directly.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <AlertDescription>
            Click the button below to assign yourself admin privileges and access the admin dashboard.
          </AlertDescription>
        </Alert>
        
        <Button 
          className="w-full" 
          onClick={handleMakeAdmin}
          disabled={isAssigning}
        >
          {isAssigning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up admin access...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Make Me Admin
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={checkAdminAccess}
          disabled={isAssigning}
        >
          Refresh Admin Status
        </Button>
      </CardContent>
    </Card>
  );
};
