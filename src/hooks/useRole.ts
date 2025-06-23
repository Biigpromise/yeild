
import { useState, useEffect } from 'react';
import { roleService } from '@/services/roleService';
import { useAuth } from '@/contexts/AuthContext';

export const useRole = (requiredRole?: string) => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setHasRequiredRole(false);
        setLoading(false);
        return;
      }

      try {
        const roles = await roleService.getCurrentUserRoles();
        const roleNames = roles.map(r => r.role);
        setUserRoles(roleNames);
        
        if (requiredRole) {
          setHasRequiredRole(roleNames.includes(requiredRole));
        }
      } catch (error) {
        console.error('Error loading user roles:', error);
        setUserRoles([]);
        setHasRequiredRole(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserRoles();
  }, [user, requiredRole]);

  const hasRole = (role: string) => userRoles.includes(role);

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator');
  const isUser = () => hasRole('user');

  // Add role property for backward compatibility
  const role = userRoles.length > 0 ? userRoles[0] : 'user';

  return {
    userRoles,
    hasRequiredRole,
    hasRole,
    isAdmin,
    isModerator,
    isUser,
    loading,
    role
  };
};
