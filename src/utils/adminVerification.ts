
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const adminVerification = {
  /**
   * Verify and grant admin access to a specific email address
   * Uses secure database function with enhanced validation
   */
  async grantAdminAccess(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_admin_access_secure', {
        user_email: email
      });

      if (error) {
        console.error('Error granting admin access:', error);
        toast.error('Failed to grant admin access: ' + error.message);
        return false;
      }

      if (data) {
        toast.success('Admin access granted successfully');
        return true;
      } else {
        toast.error('User not found with that email or email not verified');
        return false;
      }
    } catch (error) {
      console.error('Error granting admin access:', error);
      toast.error('Failed to grant admin access');
      return false;
    }
  },

  /**
   * Check if current user has admin role with enhanced security
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Use secure role checking function
      const { data, error } = await supabase.rpc('check_user_role_secure', {
        check_user_id: user.id,
        required_role: 'admin'
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};

// SECURITY NOTE: Admin verification should only be used through secure channels
// For one-time admin setup, contact system administrator
// Removed global window exposure for security reasons
