
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
        setRole('user');
        setHasRequiredRole(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking role:', error);
          setRole('user');
          setHasRequiredRole(!requiredRole || requiredRole === 'user');
        } else {
          const userRoles = data || [];
          const userRole = userRoles.length > 0 ? userRoles[0].role : 'user';
          setRole(userRole);
          
          if (requiredRole) {
            setHasRequiredRole(userRoles.some(r => r.role === requiredRole));
          } else {
            setHasRequiredRole(true);
          }
        }
      } catch (error) {
        console.error('Unexpected error checking role:', error);
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
