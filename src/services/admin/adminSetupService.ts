
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const adminSetupService = {
  // Check if current user has admin role
  async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('adminSetupService: No user found');
        return false;
      }

      console.log('adminSetupService: Checking admin access for user:', user.id, user.email);

      // Check admin role from database using the secure function
      const { data: isAdmin, error } = await supabase.rpc('is_current_user_admin_secure');
      
      if (error) {
        console.error('adminSetupService: Error checking admin role:', error);
        return false;
      }

      console.log('adminSetupService: Admin check result:', isAdmin);
      return Boolean(isAdmin);
    } catch (error) {
      console.error('adminSetupService: Exception checking admin access:', error);
      return false;
    }
  },

  // Assign admin role to current user (for initial setup)
  async makeCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('adminSetupService: No user found for admin assignment');
        toast.error('Please log in first');
        return false;
      }

      // Use the secure admin verification function that handles role assignment
      const { data: success, error } = await supabase.rpc('verify_single_admin_access', {
        user_email: user.email
      });

      if (error) {
        console.error('adminSetupService: Error assigning admin role:', error);
        toast.error('Failed to assign admin role');
        return false;
      }

      if (success) {
        console.log('adminSetupService: Successfully assigned admin role to user:', user.id);
        toast.success('Admin access granted');
        return true;
      } else {
        console.log('adminSetupService: Admin role assignment failed for user:', user.email);
        toast.error('Admin access denied');
        return false;
      }
    } catch (error) {
      console.error('adminSetupService: Exception:', error);
      toast.error('Failed to assign admin role');
      return false;
    }
  },

  // Get current user's roles
  async getCurrentUserRoles(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('adminSetupService: No user found for roles check');
        return [];
      }

      // Fetch user roles from database
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('adminSetupService: Error fetching user roles:', error);
        return [];
      }

      const userRoles = roles?.map(r => r.role) || [];
      console.log('adminSetupService: User roles:', userRoles);
      return userRoles;
    } catch (error) {
      console.error('adminSetupService: Exception fetching user roles:', error);
      return [];
    }
  }
};
