
import { supabase } from '@/integrations/supabase/client';

export const roleService = {
  async getCurrentUserRoles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      // Only yeildsocials@gmail.com has admin role
      if (user.email === 'yeildsocials@gmail.com') {
        return [{ role: 'admin' }];
      }

      // Default user role for authenticated users
      return [{ role: 'user' }];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  },

  async hasRole(role: string) {
    const roles = await this.getCurrentUserRoles();
    return roles.some(r => r.role === role);
  },

  async isAdmin() {
    return this.hasRole('admin');
  }
};
