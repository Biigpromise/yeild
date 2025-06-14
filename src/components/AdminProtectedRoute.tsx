
import React from 'react';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  return (
    <RoleProtectedRoute 
      requiredRole="admin"
      fallback={
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need administrator privileges to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact your system administrator if you believe this is an error.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </RoleProtectedRoute>
  );
};
