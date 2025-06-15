
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
  target_audience: 'all' | 'active' | 'new' | 'inactive';
  is_active: boolean;
  created_at: string;
  scheduled_for?: string;
}

export const adminContentService = {
  // Platform settings management
  async getPlatformSettings(): Promise<PlatformSettings> {
    try {
      const { data, error } = await supabase.from('platform_settings').select('key, value');

      if (error) throw error;

      const settings = data.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as any);

      return {
        siteName: settings.siteName || "YEILD",
        maintenanceMode: settings.maintenanceMode || false,
        registrationEnabled: settings.registrationEnabled || true,
        taskSubmissionEnabled: settings.taskSubmissionEnabled || true,
        withdrawalEnabled: settings.withdrawalEnabled || true,
        maxTasksPerUser: settings.maxTasksPerUser || 10,
        pointsPerTask: settings.pointsPerTask || 50,
      };
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      // Return defaults on error
      return {
        siteName: "YEILD",
        maintenanceMode: false,
        registrationEnabled: true,
        taskSubmissionEnabled: true,
        withdrawalEnabled: true,
        maxTasksPerUser: 10,
        pointsPerTask: 50
      };
    }
  },

  async updatePlatformSettings(settings: PlatformSettings): Promise<boolean> {
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      const { error } = await supabase.from('platform_settings').upsert(updates);

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
  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          target_audience: announcement.target_audience,
          is_active: announcement.is_active,
          scheduled_for: announcement.scheduled_for,
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

  async getAnnouncements(filters?: {
    isActive?: boolean;
    type?: string;
    targetAudience?: string;
  }): Promise<Announcement[]> {
    try {
      let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.targetAudience) {
        query = query.eq('target_audience', filters.targetAudience);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as Announcement[];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  },

  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;
      toast.success('Announcement deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
      return false;
    }
  },

  // System maintenance
  async toggleMaintenanceMode(enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'maintenanceMode', value: enabled });

      if (error) throw error;
      toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
      return false;
    }
  },
};
