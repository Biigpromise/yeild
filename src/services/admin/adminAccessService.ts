
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const adminAccessService = {
  // Check if current user has admin access
  async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return false;
      }

      console.log('Checking admin access for user:', user.email);

      // Check if user is the designated admin
      if (user.email === 'yeildsocials@gmail.com') {
        console.log('Admin email confirmed');
        return true;
      }

      // Also check database for admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      const hasAdminRole = roles && roles.length > 0;
      console.log('Has admin role in database:', hasAdminRole);

      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  },

  // Ensure admin role is assigned
  async ensureAdminRole(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      // Only for the designated admin email
      if (user.email !== 'yeildsocials@gmail.com') {
        return false;
      }

      // Try to insert admin role if it doesn't exist
      const { error } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.id, role: 'admin' },
          { onConflict: 'user_id,role' }
        );

      if (error) {
        console.error('Error ensuring admin role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ensuring admin role:', error);
      return false;
    }
  }
};
