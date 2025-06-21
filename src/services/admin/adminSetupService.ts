
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

      // ONLY grant access to yeildsocials@gmail.com
      if (user.email === 'yeildsocials@gmail.com') {
        console.log('adminSetupService: Admin email detected, granting access');
        return true;
      }

      console.log('adminSetupService: Access denied - not admin email');
      return false;
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

      // Only allow yeildsocials@gmail.com to become admin
      if (user.email !== 'yeildsocials@gmail.com') {
        console.error('adminSetupService: Unauthorized email attempting admin access');
        toast.error('Unauthorized access');
        return false;
      }

      console.log('adminSetupService: Attempting to make user admin:', user.id);
      toast.success('Admin access confirmed');
      return true;
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

      // Only return admin role for yeildsocials@gmail.com
      if (user.email === 'yeildsocials@gmail.com') {
        return ['admin'];
      }

      return [];
    } catch (error) {
      console.error('adminSetupService: Exception fetching user roles:', error);
      return [];
    }
  }
};
