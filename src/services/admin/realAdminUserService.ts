
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  user_roles?: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
}

export const realAdminUserService = {
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      console.log('Fetching all users from database...');
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          points,
          level,
          tasks_completed,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        return [];
      }

      // Get user IDs to fetch roles and streaks
      const userIds = profiles.map(p => p.id);

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Fetch user streaks
      const { data: streaks, error: streaksError } = await supabase
        .from('user_streaks')
        .select('user_id, current_streak')
        .in('user_id', userIds);

      if (streaksError) {
        console.error('Error fetching user streaks:', streaksError);
      }

      // Combine the data
      const users: AdminUser[] = profiles.map(profile => ({
        ...profile,
        user_roles: roles?.filter(r => r.user_id === profile.id).map(r => ({ role: r.role })) || [],
        user_streaks: streaks?.filter(s => s.user_id === profile.id).map(s => ({ current_streak: s.current_streak })) || []
      }));

      console.log('Users fetched successfully:', users.length);
      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    try {
      console.log('Updating user status:', userId, status);

      // We can't directly update auth.users, but we can manage through user_roles
      // For suspension, we could add a suspended role or handle it differently
      if (status === 'suspended') {
        // Add suspended role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'suspended'
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error suspending user:', error);
          return false;
        }
      } else {
        // Remove suspended role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'suspended');

        if (error) {
          console.error('Error activating user:', error);
          return false;
        }
      }

      toast.success(`User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  },

  async updateUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      console.log('Updating user role:', userId, newRole);

      // First remove existing roles (except suspended)
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .neq('role', 'suspended');

      // Add new role if not 'user' (default)
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole
          });

        if (error) {
          console.error('Error updating user role:', error);
          return false;
        }
      }

      toast.success(`User role updated to ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  }
};
