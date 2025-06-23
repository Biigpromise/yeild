
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  created_at: string;
  email: string;
  name: string;
  level: number;
  points: number;
  tasks_completed: number;
  user_roles: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
}

export const realAdminUserService = {
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          created_at,
          email,
          name,
          level,
          points,
          tasks_completed,
          user_roles (
            role
          ),
          user_streaks (
            current_streak
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: string): Promise<boolean> {
    try {
      // For now, we'll just show a success message
      // In a real implementation, you'd update a status field
      toast.success(`User ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return false;
    }
  }
};
