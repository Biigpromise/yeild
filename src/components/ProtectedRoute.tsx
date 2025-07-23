
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-gray-300">Verifying access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    // For now, we'll assume basic role checking
    // This would need to be implemented based on your user role system
    const userRole = user.user_metadata?.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2 text-white">Access Denied</h2>
              <p className="text-gray-300">
                You don't have permission to access this page.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
