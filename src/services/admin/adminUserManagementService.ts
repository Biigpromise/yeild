
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserActivity {
  userId: string;
  userName: string;
  lastActive: string;
  tasksCompleted: number;
  pointsEarned: number;
  streakDays: number;
  accountStatus: 'active' | 'suspended' | 'inactive';
}

export interface UserRoleAssignment {
  userId: string;
  currentRole: string;
  newRole: string;
  reason?: string;
}

export const adminUserManagementService = {
  // Enhanced user role assignment with audit trail
  async assignUserRole(assignment: UserRoleAssignment): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'assign_user_role_enhanced',
          data: {
            ...assignment,
            assignedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Role updated from ${assignment.currentRole} to ${assignment.newRole}`);
      return true;
    } catch (error) {
      console.error('Error assigning user role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  },

  // User activity monitoring
  async getUserActivity(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_user_activity',
          data: { timeframe }
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  // Account suspension/activation with reason tracking
  async updateAccountStatus(
    userId: string, 
    status: 'active' | 'suspended' | 'inactive',
    reason?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_account_status',
          data: { 
            userId, 
            status, 
            reason,
            updatedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Account ${status} successfully`);
      return true;
    } catch (error) {
      console.error('Error updating account status:', error);
      toast.error('Failed to update account status');
      return false;
    }
  },

  // Bulk user operations
  async performBulkUserOperation(
    userIds: string[], 
    operation: 'suspend' | 'activate' | 'delete' | 'assign_role',
    data?: any
  ): Promise<boolean> {
    try {
      const { data: result, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'bulk_user_operation',
          data: { userIds, operation, ...data }
        }
      });

      if (error) throw error;
      
      toast.success(`Bulk ${operation} completed for ${userIds.length} users`);
      return true;
    } catch (error) {
      console.error('Error performing bulk user operation:', error);
      toast.error('Failed to perform bulk operation');
      return false;
    }
  }
};
