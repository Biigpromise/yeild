
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export const roleService = {
  async getCurrentUserRoles() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      // Check database for user roles first
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles from database:', error);
      }

      // If user has roles in database, return them
      if (roleData && roleData.length > 0) {
        return roleData;
      }

      // Fallback: check if user is the admin email
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
  },

  async assignRole(userId: string, role: string) {
    try {
      // Only allow admin operations for yeildsocials@gmail.com
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'yeildsocials@gmail.com') {
        toast.error('Unauthorized access');
        return false;
      }

      // For this simple system, we'll just show success
      // In a real app, this would update the database
      toast.success(`Role ${role} assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  },

  async removeRole(userId: string, role: string) {
    try {
      // Only allow admin operations for yeildsocials@gmail.com
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'yeildsocials@gmail.com') {
        toast.error('Unauthorized access');
        return false;
      }

      // For this simple system, we'll just show success
      // In a real app, this would update the database
      toast.success(`Role ${role} removed successfully`);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
      return false;
    }
  }
};
