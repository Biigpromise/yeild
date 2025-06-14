
import React from 'react';
import { useRole } from '@/hooks/useRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { hasRequiredRole, loading } = useRole(requiredRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <Shield className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!hasRequiredRole) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Required role: {requiredRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
