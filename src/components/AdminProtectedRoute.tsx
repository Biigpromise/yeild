
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminSetupService } from '@/services/admin/adminSetupService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasAdminAccess(false);
        setIsChecking(false);
        return;
      }

      console.log('AdminProtectedRoute: Checking access for user:', user.email);
      setIsChecking(true);
      setError(null);

      try {
        const hasAccess = await adminSetupService.checkAdminAccess();
        console.log('AdminProtectedRoute: Access result:', hasAccess);
        setHasAdminAccess(hasAccess);
      } catch (err) {
        console.error('AdminProtectedRoute: Error checking access:', err);
        setError('Failed to verify admin access');
        setHasAdminAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, authLoading]);

  if (authLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yeild-black">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying admin access...</span>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-yeild-black">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              You do not have the necessary administrator privileges to access this page.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
            
            {user && (
              <p className="text-sm text-gray-400 mb-4">
                Logged in as: {user.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full bg-yeild-yellow text-yeild-black hover:bg-yeild-yellow/90">
              <Link to="/dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Contact your system administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
