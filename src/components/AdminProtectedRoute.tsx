
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminSetupService } from '@/services/admin/adminSetupService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      console.log('AdminProtectedRoute: No user found');
      setHasAdminAccess(false);
      setIsLoading(false);
      return;
    }

    console.log('AdminProtectedRoute: Checking admin access for user:', user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const hasAccess = await adminSetupService.checkAdminAccess();
      console.log('AdminProtectedRoute: Admin access result:', hasAccess);
      setHasAdminAccess(hasAccess);
    } catch (err) {
      console.error('AdminProtectedRoute: Error checking admin access:', err);
      setError('Failed to verify admin access');
      setHasAdminAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">
          Checking admin access...
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Admin Access Required</h1>
            <p className="text-muted-foreground mb-6">
              You need administrator privileges to access this page. Set up admin access to continue.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
            
            {user && (
              <p className="text-sm text-muted-foreground mb-4">
                Currently logged in as: {user.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/admin-setup">
                <Shield className="h-4 w-4 mr-2" />
                Setup Admin Access
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={checkAdminAccess}
            >
              Refresh Access Check
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Contact your system administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
