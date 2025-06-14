
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Settings } from 'lucide-react';
import { adminSetupService } from '@/services/admin/adminSetupService';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminAccessHelper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Checking admin access...');
    const hasAccess = await adminSetupService.checkAdminAccess();
    console.log('Admin access result:', hasAccess);
    setHasAdminAccess(hasAccess);
    setIsLoading(false);
  };

  const handleMakeAdmin = async () => {
    setIsAssigning(true);
    console.log('Making user admin...');
    const success = await adminSetupService.makeCurrentUserAdmin();
    if (success) {
      setHasAdminAccess(true);
      // Add a small delay then redirect to admin
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    }
    setIsAssigning(false);
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
          <div className="text-center">Checking admin access...</div>
        </CardContent>
      </Card>
    );
  }

  if (hasAdminAccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Shield className="h-5 w-5" />
            Admin Access Confirmed
          </CardTitle>
          <CardDescription>
            You have admin privileges and can access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={() => navigate('/admin')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Go to Admin Dashboard
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
          <Shield className="h-4 w-4 mr-2" />
          {isAssigning ? 'Setting up admin access...' : 'Make Me Admin'}
        </Button>
      </CardContent>
    </Card>
  );
};
