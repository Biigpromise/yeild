
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
      // Check if current user is admin using secure function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return false;
      }

      const isAdmin = await supabase.rpc('check_user_role_secure', {
        check_user_id: user.id,
        required_role: 'admin'
      });

      if (!isAdmin.data) {
        toast.error('Admin access required');
        return false;
      }

      // Assign role securely
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role })
        .select();

      if (error) {
        console.error('Error assigning role:', error);
        toast.error('Failed to assign role');
        return false;
      }

      // Log the role assignment for audit
      await supabase.rpc('log_security_event', {
        user_id_param: userId,
        event_type: 'role_assigned',
        event_details: { 
          assigned_role: role, 
          assigned_by: user.id,
          assigned_by_email: user.email 
        }
      });

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
      // Check if current user is admin using secure function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication required');
        return false;
      }

      const isAdmin = await supabase.rpc('check_user_role_secure', {
        check_user_id: user.id,
        required_role: 'admin'
      });

      if (!isAdmin.data) {
        toast.error('Admin access required');
        return false;
      }

      // Remove role securely
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Error removing role:', error);
        toast.error('Failed to remove role');
        return false;
      }

      // Log the role removal for audit
      await supabase.rpc('log_security_event', {
        user_id_param: userId,
        event_type: 'role_removed',
        event_details: { 
          removed_role: role, 
          removed_by: user.id,
          removed_by_email: user.email 
        }
      });

      toast.success(`Role ${role} removed successfully`);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
      return false;
    }
  }
};
