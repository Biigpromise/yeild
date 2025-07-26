
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useRole = (requiredRole: string) => {
  const { user } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setHasRequiredRole(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', requiredRole)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking role:', error);
          setHasRequiredRole(false);
        } else {
          setHasRequiredRole(!!data);
        }
      } catch (error) {
        console.error('Unexpected error checking role:', error);
        setHasRequiredRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [user, requiredRole]);

  return { hasRequiredRole, loading };
};
