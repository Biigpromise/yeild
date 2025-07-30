import { supabase } from '@/integrations/supabase/client';

export interface TaskAnnouncement {
  id?: string;
  brand_id: string;
  title: string;
  description: string;
  task_category?: string;
  estimated_launch_date?: string;
  estimated_budget?: number;
  target_audience?: any;
  requirements?: any;
  status?: 'draft' | 'published' | 'launched' | 'cancelled';
  is_active?: boolean;
}

export interface UserTaskInterest {
  id?: string;
  user_id: string;
  announcement_id: string;
  interest_level: 'interested' | 'very_interested' | 'notify_me';
}

export const taskAnnouncementService = {
  // Create a new task announcement (brands only)
  async createAnnouncement(announcement: TaskAnnouncement) {
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .insert(announcement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing announcement
  async updateAnnouncement(id: string, updates: Partial<TaskAnnouncement>) {
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get announcements for a brand
  async getBrandAnnouncements(brandId: string) {
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .select(`
        *,
        user_task_interests(id, user_id, interest_level)
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get published announcements for users
  async getPublishedAnnouncements() {
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .select(`
        *,
        brand_profiles!inner(company_name, logo_url),
        user_task_interests(id, interest_level)
      `)
      .eq('status', 'published')
      .eq('is_active', true)
      .order('estimated_launch_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data;
  },

  // Publish an announcement (send notifications)
  async publishAnnouncement(id: string) {
    // Update status to published
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .update({ status: 'published' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send announcement emails
    try {
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
        'send-task-announcement-email',
        {
          body: {
            announcementId: id,
            emailType: 'interest_notification',
            targetAudience: 'all'
          }
        }
      );

      if (emailError) {
        console.error('Failed to send announcement emails:', emailError);
      } else {
        console.log('Announcement emails sent:', emailResponse);
      }
    } catch (emailError) {
      console.error('Error sending announcement emails:', emailError);
    }

    return data;
  },

  // Mark task as launched and notify interested users
  async launchTask(id: string) {
    const { data, error } = await supabase
      .from('brand_task_announcements')
      .update({ status: 'launched' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send launch notification to interested users
    try {
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
        'send-task-announcement-email',
        {
          body: {
            announcementId: id,
            emailType: 'launch_notification',
            targetAudience: 'interested_users'
          }
        }
      );

      if (emailError) {
        console.error('Failed to send launch emails:', emailError);
      }
    } catch (emailError) {
      console.error('Error sending launch emails:', emailError);
    }

    return data;
  },

  // User shows interest in an announcement
  async showInterest(interest: UserTaskInterest) {
    const { data, error } = await supabase
      .from('user_task_interests')
      .insert(interest)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove user interest
  async removeInterest(userId: string, announcementId: string) {
    const { error } = await supabase
      .from('user_task_interests')
      .delete()
      .eq('user_id', userId)
      .eq('announcement_id', announcementId);

    if (error) throw error;
  },

  // Get user's interests
  async getUserInterests(userId: string) {
    const { data, error } = await supabase
      .from('user_task_interests')
      .select(`
        *,
        brand_task_announcements!inner(
          id,
          title,
          description,
          status,
          estimated_launch_date,
          brand_profiles!inner(company_name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get announcement analytics for brands
  async getAnnouncementAnalytics(announcementId: string) {
    const { data, error } = await supabase
      .from('user_task_interests')
      .select('interest_level')
      .eq('announcement_id', announcementId);

    if (error) throw error;

    const analytics = {
      total_interested: data.length,
      interested: data.filter(i => i.interest_level === 'interested').length,
      very_interested: data.filter(i => i.interest_level === 'very_interested').length,
      notify_me: data.filter(i => i.interest_level === 'notify_me').length
    };

    return analytics;
  }
};