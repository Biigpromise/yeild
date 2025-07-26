
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, loading } = useAuth();
  const { hasRequiredRole, loading: roleLoading } = useRole(requiredRole);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
