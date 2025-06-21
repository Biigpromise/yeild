
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const adminVerification = {
  /**
   * Verify and grant admin access to a specific email address
   * This should only be used once for initial admin setup
   */
  async grantAdminAccess(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_single_admin_access', {
        user_email: email
      });

      if (error) {
        console.error('Error granting admin access:', error);
        toast.error('Failed to grant admin access');
        return false;
      }

      if (data) {
        toast.success('Admin access granted successfully');
        return true;
      } else {
        toast.error('User not found with that email');
        return false;
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
      toast.error('Failed to grant admin access');
      return false;
    }
  },

  /**
   * Check if current user has admin role
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};

// For one-time admin setup, you can call this in the browser console:
// adminVerification.grantAdminAccess('your-email@example.com')
declare global {
  interface Window {
    adminVerification: typeof adminVerification;
  }
}

window.adminVerification = adminVerification;
