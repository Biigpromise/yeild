
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AuthGuardOptions {
  requireAuth?: boolean;
  requiredRole?: string;
}

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      setChecking(true);
      try {
        // If auth is not required, allow access
        if (!options.requireAuth) {
          setHasAccess(true);
          setChecking(false);
          return;
        }

        // If auth is required but no user, deny access
        if (options.requireAuth && !user) {
          setHasAccess(false);
          setChecking(false);
          return;
        }

        // If we have a user and no specific role is required, allow access
        if (user && !options.requiredRole) {
          setHasAccess(true);
          setChecking(false);
          return;
        }

        // For role-based access, we would check roles here
        // For now, just allow access if user exists
        setHasAccess(!!user);
      } catch (error) {
        console.error('Auth guard hook error:', error);
        // Default to allowing access for non-critical errors
        setHasAccess(!options.requireAuth);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, loading, options.requireAuth, options.requiredRole]);

  return { hasAccess, checking, isAuthenticated: !!user };
};
