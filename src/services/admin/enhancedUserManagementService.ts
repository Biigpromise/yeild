
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserActivityData {
  userId: string;
  userName: string;
  email: string;
  lastActive: string;
  tasksCompleted: number;
  pointsEarned: number;
  streakDays: number;
  accountStatus: 'active' | 'suspended' | 'banned' | 'inactive';
  suspensionReason?: string;
  suspendedUntil?: string;
  joinDate: string;
  totalLogins: number;
  lastLogin?: string;
}

export interface UserSearchFilters {
  searchTerm?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  pointsRange?: {
    min: number;
    max: number;
  };
  tasksRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'name' | 'email' | 'points' | 'tasks' | 'joinDate' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkOperation {
  userIds: string[];
  operation: 'suspend' | 'unsuspend' | 'ban' | 'unban' | 'activate' | 'delete';
  reason?: string;
  duration?: number; // days for suspension
}

export interface SuspensionAction {
  userId: string;
  reason: string;
  duration?: number; // days, undefined for permanent
}

export const enhancedUserManagementService = {
  // Enhanced user search with filters
  async searchUsers(filters: UserSearchFilters): Promise<UserActivityData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'search_users_enhanced',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      return [];
    }
  },

  // User suspension with reason and duration
  async suspendUser(action: SuspensionAction): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'suspend_user_enhanced',
          data: {
            ...action,
            suspendedAt: new Date().toISOString(),
            suspendedUntil: action.duration 
              ? new Date(Date.now() + action.duration * 24 * 60 * 60 * 1000).toISOString()
              : null
          }
        }
      });

      if (error) throw error;
      
      const durationText = action.duration ? `for ${action.duration} days` : 'permanently';
      toast.success(`User suspended ${durationText}`);
      return true;
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
      return false;
    }
  },

  // User ban (permanent suspension)
  async banUser(userId: string, reason: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'ban_user',
          data: { 
            userId, 
            reason,
            bannedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success('User banned successfully');
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
      return false;
    }
  },

  // Unsuspend/unban user
  async unsuspendUser(userId: string, reason?: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'unsuspend_user',
          data: { 
            userId, 
            reason: reason || 'Manual unsuspension',
            unsuspendedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success('User unsuspended successfully');
      return true;
    } catch (error) {
      console.error('Error unsuspending user:', error);
      toast.error('Failed to unsuspend user');
      return false;
    }
  },

  // Bulk operations on multiple users
  async performBulkOperation(operation: BulkOperation): Promise<boolean> {
    if (operation.userIds.length === 0) {
      toast.error('No users selected');
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'bulk_user_operation_enhanced',
          data: {
            ...operation,
            performedAt: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      
      toast.success(`Bulk ${operation.operation} completed for ${operation.userIds.length} users`);
      return true;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error(`Failed to perform bulk ${operation.operation}`);
      return false;
    }
  },

  // Get detailed user activity
  async getUserActivityDetails(userId: string): Promise<UserActivityData | null> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_user_activity_details',
          data: { userId }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user activity details:', error);
      return null;
    }
  },

  // Get user activity timeline
  async getUserActivityTimeline(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_user_activity_timeline',
          data: { userId, limit }
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity timeline:', error);
      return [];
    }
  },

  // Get suspension history for a user
  async getUserSuspensionHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_user_suspension_history',
          data: { userId }
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suspension history:', error);
      return [];
    }
  }
};
