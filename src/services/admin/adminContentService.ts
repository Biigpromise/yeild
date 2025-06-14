
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlatformSettings {
  siteName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  taskSubmissionEnabled: boolean;
  withdrawalEnabled: boolean;
  maxTasksPerUser: number;
  pointsPerTask: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'active' | 'new' | 'inactive';
  isActive: boolean;
  createdAt: string;
  scheduledFor?: string;
}

export interface ContentPolicy {
  autoApproval: boolean;
  moderationRequired: boolean;
  bannedWords: string[];
  maxSubmissionSize: number;
  allowedFileTypes: string[];
}

export const adminContentService = {
  // Platform settings management
  async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_platform_settings'
        }
      });

      if (error) throw error;
      return data || {
        siteName: "YEILD",
        maintenanceMode: false,
        registrationEnabled: true,
        taskSubmissionEnabled: true,
        withdrawalEnabled: true,
        maxTasksPerUser: 10,
        pointsPerTask: 50
      };
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      throw error;
    }
  },

  async updatePlatformSettings(settings: PlatformSettings): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_platform_settings',
          data: settings
        }
      });

      if (error) throw error;
      toast.success('Platform settings updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating platform settings:', error);
      toast.error('Failed to update platform settings');
      return false;
    }
  },

  // Announcement management
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'create_announcement',
          data: announcement
        }
      });

      if (error) throw error;
      toast.success('Announcement created successfully');
      return true;
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
      return false;
    }
  },

  async broadcastAnnouncement(
    announcementId: string,
    targetAudience: string = 'all'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'broadcast_announcement',
          data: { announcementId, targetAudience }
        }
      });

      if (error) throw error;
      toast.success(`Announcement broadcasted to ${targetAudience} users`);
      return true;
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
      toast.error('Failed to broadcast announcement');
      return false;
    }
  },

  async getAnnouncements(filters?: {
    isActive?: boolean;
    type?: string;
    targetAudience?: string;
  }): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_announcements',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'delete_announcement',
          data: { announcementId }
        }
      });

      if (error) throw error;
      toast.success('Announcement deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
      return false;
    }
  },

  // Content policy management
  async getContentPolicy(): Promise<ContentPolicy> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_content_policy'
        }
      });

      if (error) throw error;
      return data || {
        autoApproval: false,
        moderationRequired: true,
        bannedWords: [],
        maxSubmissionSize: 5,
        allowedFileTypes: ['jpg', 'png', 'pdf', 'doc']
      };
    } catch (error) {
      console.error('Error fetching content policy:', error);
      throw error;
    }
  },

  async updateContentPolicy(policy: ContentPolicy): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_content_policy',
          data: policy
        }
      });

      if (error) throw error;
      toast.success('Content policy updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating content policy:', error);
      toast.error('Failed to update content policy');
      return false;
    }
  },

  // System maintenance
  async toggleMaintenanceMode(enabled: boolean): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'toggle_maintenance_mode',
          data: { enabled }
        }
      });

      if (error) throw error;
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
      return false;
    }
  },

  // Content moderation
  async getContentModerationQueue(): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_content_moderation_queue'
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      return [];
    }
  },

  async moderateContent(
    contentId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'moderate_content',
          data: { contentId, action, reason }
        }
      });

      if (error) throw error;
      toast.success(`Content ${action}d successfully`);
      return true;
    } catch (error) {
      console.error('Error moderating content:', error);
      toast.error('Failed to moderate content');
      return false;
    }
  }
};
