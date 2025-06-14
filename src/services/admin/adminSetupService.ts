
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const adminSetupService = {
  // Check if current user has admin role - using direct query to bypass RLS issues
  async checkAdminAccess(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('adminSetupService: No user found');
        return false;
      }

      console.log('adminSetupService: Checking admin access for user:', user.id);

      // Use the admin-operations edge function to bypass RLS issues
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'check_admin_access',
          user_id: user.id 
        }
      });

      if (error) {
        console.error('adminSetupService: Error checking admin access via edge function:', error);
        // Fallback to direct query if edge function fails
        return await this.checkAdminAccessFallback(user.id);
      }

      const hasAdmin = !!data?.has_admin_access;
      console.log('adminSetupService: Admin role found via edge function:', hasAdmin);
      return hasAdmin;
    } catch (error) {
      console.error('adminSetupService: Exception checking admin access:', error);
      return false;
    }
  },

  // Fallback method for checking admin access
  async checkAdminAccessFallback(userId: string): Promise<boolean> {
    try {
      console.log('adminSetupService: Using fallback admin check');
      
      // Direct query with service role to bypass RLS
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('adminSetupService: Fallback error:', error);
        return false;
      }

      const hasAdmin = !!data;
      console.log('adminSetupService: Fallback admin role found:', hasAdmin);
      return hasAdmin;
    } catch (error) {
      console.error('adminSetupService: Fallback exception:', error);
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

      console.log('adminSetupService: Attempting to make user admin:', user.id);

      // Use the admin-operations edge function for role assignment
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          action: 'assign_admin_role',
          user_id: user.id 
        }
      });

      if (error) {
        console.error('adminSetupService: Error assigning admin role via edge function:', error);
        // Fallback to direct insert
        return await this.makeCurrentUserAdminFallback(user.id);
      }

      if (data?.success) {
        console.log('adminSetupService: Admin role assigned successfully via edge function');
        toast.success('Admin role assigned successfully! Redirecting...');
        return true;
      } else {
        console.error('adminSetupService: Failed to assign admin role via edge function');
        return await this.makeCurrentUserAdminFallback(user.id);
      }
    } catch (error) {
      console.error('adminSetupService: Exception assigning admin role:', error);
      toast.error('Failed to assign admin role');
      return false;
    }
  },

  // Fallback method for assigning admin role
  async makeCurrentUserAdminFallback(userId: string): Promise<boolean> {
    try {
      console.log('adminSetupService: Using fallback admin assignment');

      // Direct insert with conflict handling
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (insertError) {
        console.error('adminSetupService: Fallback insert error:', insertError);
        
        // Check if it's a duplicate key error (user already has admin role)
        if (insertError.code === '23505') {
          console.log('adminSetupService: Duplicate key - user already has admin role');
          toast.success('You already have admin access');
          return true;
        }
        
        toast.error('Failed to assign admin role: ' + insertError.message);
        return false;
      }

      console.log('adminSetupService: Fallback admin role assigned successfully');
      toast.success('Admin role assigned successfully! Redirecting...');
      return true;
    } catch (error) {
      console.error('adminSetupService: Fallback exception:', error);
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

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('adminSetupService: Error fetching user roles:', error);
        return [];
      }
      
      const roles = data?.map(r => r.role) || [];
      console.log('adminSetupService: User roles:', roles);
      return roles;
    } catch (error) {
      console.error('adminSetupService: Exception fetching user roles:', error);
      return [];
    }
  }
};
