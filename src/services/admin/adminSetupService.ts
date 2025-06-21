
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

      console.log('adminSetupService: Checking admin access for user:', user.id);

      // Check if this is the specific admin email
      if (user.email === 'yeildsocials@gmail.com') {
        console.log('adminSetupService: Admin email detected, granting access');
        return true;
      }

      // Fallback to role check with better error handling
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('adminSetupService: Error checking admin access:', error);
          // If there's a policy error, fall back to email check
          return user.email === 'yeildsocials@gmail.com';
        }

        const hasAdmin = !!data;
        console.log('adminSetupService: Admin role found:', hasAdmin);
        return hasAdmin;
      } catch (roleError) {
        console.error('adminSetupService: Role check failed, falling back to email check:', roleError);
        return user.email === 'yeildsocials@gmail.com';
      }
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

      // Only allow yeildsocials@gmail.com to make themselves admin
      if (user.email !== 'yeildsocials@gmail.com') {
        toast.error('Unauthorized: Only yeildsocials@gmail.com can access admin functions');
        return false;
      }

      console.log('adminSetupService: Attempting to make user admin:', user.id);

      try {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          });

        if (insertError) {
          console.error('adminSetupService: Insert error:', insertError);
          
          // Check if it's a duplicate key error (user already has admin role)
          if (insertError.code === '23505') {
            console.log('adminSetupService: User already has admin role');
            toast.success('You already have admin access');
            return true;
          }
          
          toast.error('Failed to assign admin role: ' + insertError.message);
          return false;
        }

        console.log('adminSetupService: Admin role assigned successfully');
        toast.success('Admin role assigned successfully!');
        return true;
      } catch (roleError) {
        console.error('adminSetupService: Role assignment failed:', roleError);
        // For yeildsocials@gmail.com, we still return true as they have access
        if (user.email === 'yeildsocials@gmail.com') {
          toast.success('Admin access confirmed');
          return true;
        }
        toast.error('Failed to assign admin role');
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

      // For the specific admin email, always return admin role
      if (user.email === 'yeildsocials@gmail.com') {
        return ['admin'];
      }

      try {
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
      } catch (roleError) {
        console.error('adminSetupService: Role fetch failed:', roleError);
        return [];
      }
    } catch (error) {
      console.error('adminSetupService: Exception fetching user roles:', error);
      return [];
    }
  }
};
