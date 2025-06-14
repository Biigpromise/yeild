
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  assigned_by?: string;
  assigned_at: string;
}

export const roleService = {
  // Get user's roles
  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  },

  // Check if user has specific role
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: role });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  // Get current user's roles
  async getCurrentUserRoles(): Promise<UserRole[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      return await this.getUserRoles(user.id);
    } catch (error) {
      console.error('Error fetching current user roles:', error);
      return [];
    }
  },

  // Check if current user has specific role
  async currentUserHasRole(role: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      return await this.hasRole(user.id, role);
    } catch (error) {
      console.error('Error checking current user role:', error);
      return false;
    }
  },

  // Assign role to user (admin only)
  async assignRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: user.id
        });

      if (error) throw error;
      toast.success(`Role ${role} assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  },

  // Remove role from user (admin only)
  async removeRole(userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      toast.success(`Role ${role} removed successfully`);
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
      return false;
    }
  },

  // Update user role (admin only) - removes old role and assigns new one
  async updateUserRole(userId: string, oldRole: string, newRole: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Remove old role and add new role in a transaction-like manner
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', oldRole);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: user.id
        });

      if (insertError) throw insertError;

      toast.success(`User role updated from ${oldRole} to ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  }
};
