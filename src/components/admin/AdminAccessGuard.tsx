
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAccessService } from '@/services/admin/adminAccessService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, RefreshCw } from 'lucide-react';

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

export const AdminAccessGuard: React.FC<AdminAccessGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    setChecking(true);
    try {
      // First ensure admin role exists
      await adminAccessService.ensureAdminRole();
      
      // Then check access
      const access = await adminAccessService.checkAdminAccess();
      setHasAccess(access);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setHasAccess(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkAccess();
    }
  }, [user, authLoading]);

  if (authLoading || checking || hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access the admin panel.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin panel.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Current user: {user.email}
            </p>
            <Button onClick={checkAccess} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Access Check
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
