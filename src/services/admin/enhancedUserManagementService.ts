
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserSearchFilters {
  searchTerm?: string;
  status?: 'all' | 'active' | 'suspended' | 'banned' | 'inactive';
  sortBy?: 'name' | 'email' | 'points' | 'tasks' | 'joinDate' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  pointsRange?: {
    min?: number;
    max?: number;
  };
  tasksRange?: {
    min?: number;
    max?: number;
  };
}

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
  taskCompletionRate: number;
  averageSessionDuration: number;
  totalSessionTime: number;
  longestStreak: number;
  currentLoginStreak: number;
}

export interface UserSessionData {
  id: string;
  sessionStart: string;
  sessionEnd?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  operatingSystem?: string;
  locationCountry?: string;
  locationCity?: string;
  isActive: boolean;
  duration?: number;
}

export interface UserStreakData {
  streakType: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakStartDate?: string;
}

export interface UserActivityTimeline {
  id: string;
  activityType: string;
  activityData: any;
  timestamp: string;
  ipAddress?: string;
  description: string;
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

  // Enhanced user search with activity data
  async searchUsersWithActivity(filters: UserSearchFilters): Promise<UserActivityData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'search_users_with_activity',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users with activity:', error);
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

  // Get detailed user profile with activity metrics
  async getUserProfileWithActivity(userId: string): Promise<UserActivityData | null> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_streaks(*),
          user_sessions!inner(*)
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get login streak data
      const { data: loginStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'login')
        .single();

      // Get task completion streak data
      const { data: taskStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'task_completion')
        .single();

      // Get session count
      const { count: sessionCount } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      return {
        userId: profile.id,
        userName: profile.name || 'Unknown',
        email: profile.email || '',
        lastActive: profile.last_active_at || profile.updated_at,
        tasksCompleted: profile.tasks_completed || 0,
        pointsEarned: profile.points || 0,
        streakDays: taskStreak?.current_streak || 0,
        accountStatus: 'active', // Default, can be enhanced with actual status logic
        joinDate: profile.created_at,
        totalLogins: sessionCount || 0,
        lastLogin: profile.last_login_at,
        taskCompletionRate: Number(profile.task_completion_rate) || 0,
        averageSessionDuration: profile.average_session_duration || 0,
        totalSessionTime: profile.total_session_time || 0,
        longestStreak: taskStreak?.longest_streak || 0,
        currentLoginStreak: loginStreak?.current_streak || 0
      };
    } catch (error) {
      console.error('Error fetching user profile with activity:', error);
      return null;
    }
  },

  // Get user session history
  async getUserSessions(userId: string, limit: number = 50): Promise<UserSessionData[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_start', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(session => ({
        id: session.id,
        sessionStart: session.session_start,
        sessionEnd: session.session_end || undefined,
        ipAddress: session.ip_address || undefined,
        userAgent: session.user_agent || undefined,
        deviceType: session.device_type || undefined,
        browser: session.browser || undefined,
        operatingSystem: session.operating_system || undefined,
        locationCountry: session.location_country || undefined,
        locationCity: session.location_city || undefined,
        isActive: session.is_active,
        duration: session.session_end 
          ? Math.round((new Date(session.session_end).getTime() - new Date(session.session_start).getTime()) / (1000 * 60))
          : undefined
      }));
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  },

  // Get user streaks data
  async getUserStreaks(userId: string): Promise<UserStreakData[]> {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(streak => ({
        streakType: streak.streak_type,
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        lastActivityDate: streak.last_activity_date || undefined,
        streakStartDate: streak.streak_start_date || undefined
      }));
    } catch (error) {
      console.error('Error fetching user streaks:', error);
      return [];
    }
  },

  // Get user activity timeline
  async getUserActivityTimeline(userId: string, limit: number = 50): Promise<UserActivityTimeline[]> {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(activity => ({
        id: activity.id,
        activityType: activity.activity_type,
        activityData: activity.activity_data,
        timestamp: activity.created_at,
        ipAddress: activity.ip_address || undefined,
        description: this.getActivityDescription(activity.activity_type, activity.activity_data)
      }));
    } catch (error) {
      console.error('Error fetching user activity timeline:', error);
      return [];
    }
  },

  // Helper function to format activity descriptions
  getActivityDescription(activityType: string, activityData: any): string {
    switch (activityType) {
      case 'login':
        return 'User logged in';
      case 'logout':
        return 'User logged out';
      case 'task_start':
        return `Started task: ${activityData?.taskTitle || 'Unknown'}`;
      case 'task_complete':
        return `Completed task: ${activityData?.taskTitle || 'Unknown'}`;
      case 'page_view':
        return `Viewed page: ${activityData?.page || 'Unknown'}`;
      case 'profile_update':
        return 'Updated profile';
      default:
        return `${activityType.replace('_', ' ')}`;
    }
  },

  // Track user activity
  async trackUserActivity(
    userId: string, 
    activityType: string, 
    activityData?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData || {},
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
  },

  // Create user session
  async createUserSession(
    userId: string,
    sessionData: {
      ipAddress?: string;
      userAgent?: string;
      deviceType?: string;
      browser?: string;
      operatingSystem?: string;
      locationCountry?: string;
      locationCity?: string;
    }
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          ...sessionData
        })
        .select('id')
        .single();

      if (error) throw error;

      // Update login streak and profile
      await this.trackUserActivity(userId, 'login');
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_streak_type: 'login'
      });

      // Update profile login data
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: 0, // Will be incremented by trigger or function
          last_active_at: new Date().toISOString()
        })
        .eq('id', userId);

      return data.id;
    } catch (error) {
      console.error('Error creating user session:', error);
      return null;
    }
  },

  // End user session
  async endUserSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          is_active: false
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error ending user session:', error);
      return false;
    }
  }
};
