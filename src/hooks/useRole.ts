
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useRole = (requiredRole?: string) => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('user');
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        console.log('useRole: No user found');
        setRole('user');
        setHasRequiredRole(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useRole: Checking role for user:', user.id, user.email);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error && error.code !== 'PGRST116') {
          console.error('useRole: Error checking role:', error);
          setRole('user');
          setHasRequiredRole(!requiredRole || requiredRole === 'user');
        } else {
          const userRoles = data || [];
          console.log('useRole: Found user roles:', userRoles);
          const userRole = userRoles.length > 0 ? userRoles[0].role : 'user';
          console.log('useRole: Setting role to:', userRole);
          setRole(userRole);
          
          if (requiredRole) {
            const hasRole = userRoles.some(r => r.role === requiredRole);
            console.log('useRole: Required role check for', requiredRole, ':', hasRole);
            setHasRequiredRole(hasRole);
          } else {
            setHasRequiredRole(true);
          }
        }
      } catch (error) {
        console.error('useRole: Unexpected error checking role:', error);
        setRole('user');
        setHasRequiredRole(!requiredRole || requiredRole === 'user');
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, requiredRole]);

  return { 
    hasRequiredRole, 
    loading, 
    role,
    isAdmin: role === 'admin'
  };
};
