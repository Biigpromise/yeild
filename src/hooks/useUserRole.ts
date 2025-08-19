import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        console.log('useUserRole: No user found');
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('useUserRole: Checking roles for user:', user.id, user.email);
        
        // Get ALL roles for the user (not just single)
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('useUserRole: Error fetching user roles:', error);
          setUserRole('user'); // Default to user if error
        } else {
          const roles = data || [];
          console.log('useUserRole: Found roles:', roles);
          
          // Prioritize admin role if present, then brand, then user
          if (roles.some(r => r.role === 'admin')) {
            console.log('useUserRole: Setting role to admin');
            setUserRole('admin');
          } else if (roles.some(r => r.role === 'brand')) {
            console.log('useUserRole: Setting role to brand');
            setUserRole('brand');
          } else {
            console.log('useUserRole: Setting role to user (default)');
            setUserRole('user');
          }
        }
      } catch (error) {
        console.error('useUserRole: Exception checking user role:', error);
        setUserRole('user');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return { userRole, loading };
};