
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminSetupService } from '@/services/admin/adminSetupService';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const ADMIN_CACHE_KEY = "isAdmin";
const ADMIN_CACHE_EXPIRY_KEY = "isAdminExpiry";
const CACHE_MINUTES = 60; // Cache admin status for 60 minutes

function setAdminCache(value: boolean) {
  sessionStorage.setItem(ADMIN_CACHE_KEY, value ? "true" : "false");
  const expiry = Date.now() + CACHE_MINUTES * 60_000;
  sessionStorage.setItem(ADMIN_CACHE_EXPIRY_KEY, expiry.toString());
}

function getAdminCache(): boolean | null {
  const expiryStr = sessionStorage.getItem(ADMIN_CACHE_EXPIRY_KEY);
  const value = sessionStorage.getItem(ADMIN_CACHE_KEY);
  if (!expiryStr || !value) return null;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) {
    sessionStorage.removeItem(ADMIN_CACHE_KEY);
    sessionStorage.removeItem(ADMIN_CACHE_EXPIRY_KEY);
    return null;
  }
  return value === "true";
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  // Use null initially to know if check hasn't been performed, otherwise use the cached value 
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(() => getAdminCache());
  const [isChecking, setIsChecking] = useState(hasAdminAccess === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only check admin access if cache is missing or expired
    if (hasAdminAccess !== null || authLoading) {
      setIsChecking(false);
      return;
    }

    const checkAccess = async () => {
      if (!user) {
        setHasAdminAccess(false);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const hasAccess = await adminSetupService.checkAdminAccess();
        setAdminCache(hasAccess);
        setHasAdminAccess(hasAccess);
      } catch (err) {
        setError('Failed to verify admin access');
        setHasAdminAccess(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Always update cache if logged out or user changes
  useEffect(() => {
    if (!user && !authLoading) {
      setAdminCache(false);
      setHasAdminAccess(false);
    }
  }, [user, authLoading]);

  if (isChecking) {
    // Less intrusive: Only show loader overlay if we have no admin info and not already loaded from cache
    return (
      <div className="flex items-center justify-center min-h-screen z-30 bg-background/80">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying admin access...</span>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You do not have the necessary administrator privileges to access this page.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
            
            {user && (
              <p className="text-sm text-muted-foreground mb-4">
                Logged in as: {user.email}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
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
