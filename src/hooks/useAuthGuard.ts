
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard, AuthGuardOptions } from '@/services/security/authGuard';

export const useAuthGuard = (options: AuthGuardOptions = {}) => {
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      setChecking(true);
      try {
        const access = await AuthGuard.checkAccess(options);
        setHasAccess(access);
      } catch (error) {
        console.error('Auth guard hook error:', error);
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, loading, options.requireAuth, options.requiredRole]);

  return { hasAccess, checking, isAuthenticated: !!user };
};
