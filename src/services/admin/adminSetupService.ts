
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const adminSetupService = {
  // Check if current user has admin role
  async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return false;
      }

      console.log('Checking admin access for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No admin role found for user');
          return false;
        }
        console.error('Error checking admin access:', error);
        return false;
      }

      console.log('Admin role found:', data);
      return !!data;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  },

  // Assign admin role to current user (for initial setup)
  async makeCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in first');
        return false;
      }

      console.log('Attempting to make user admin:', user.id);

      // First check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        toast.success('You already have admin access');
        return true;
      }

      // Insert admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) {
        console.error('Error assigning admin role:', error);
        if (error.code === '23505') {
          toast.success('You already have admin access');
          return true;
        }
        toast.error('Failed to assign admin role: ' + error.message);
        return false;
      }

      console.log('Admin role assigned successfully');
      toast.success('Admin role assigned successfully');
      return true;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast.error('Failed to assign admin role');
      return false;
    }
  },

  // Get current user's roles
  async getCurrentUserRoles(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      const roles = data.map(r => r.role) || [];
      console.log('User roles:', roles);
      return roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }
};
