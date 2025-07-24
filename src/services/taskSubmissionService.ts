import { supabase } from '@/integrations/supabase/client';

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: any;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  points_awarded?: number;
  tasks?: {
    id?: string;
    title?: string;
    description?: string;
    points?: number;
    difficulty?: string;
    category?: string;
  } | null;
  profiles?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
}

export const taskSubmissionService = {
  async getAllSubmissions(): Promise<TaskSubmission[]> {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks (
          id,
          title,
          description,
          points,
          difficulty,
          category
        ),
        profiles (
          id,
          name,
          email
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching task submissions:', error);
      throw error;
    }

    return (data || []) as unknown as TaskSubmission[];
  },

  async getPendingSubmissions(): Promise<TaskSubmission[]> {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks (
          id,
          title,
          description,
          points,
          difficulty,
          category
        ),
        profiles (
          id,
          name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending submissions:', error);
      throw error;
    }

    return (data || []) as unknown as TaskSubmission[];
  },

  async updateSubmissionStatus(
    submissionId: string, 
    status: 'approved' | 'rejected',
    adminNotes?: string,
    pointsAwarded?: number
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (pointsAwarded !== undefined) {
        updateData.points_awarded = pointsAwarded;
      }

      const { error } = await supabase
        .from('task_submissions')
        .update(updateData)
        .eq('id', submissionId);

      if (error) {
        console.error('Error updating submission status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSubmissionStatus:', error);
      return false;
    }
  },

  async getSubmissionById(submissionId: string): Promise<TaskSubmission | null> {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks (
          id,
          title,
          description,
          points,
          difficulty,
          category
        ),
        profiles (
          id,
          name,
          email
        )
      `)
      .eq('id', submissionId)
      .single();

    if (error) {
      console.error('Error fetching submission:', error);
      return null;
    }

    return data as unknown as TaskSubmission;
  },

  async getSubmissionStats() {
    try {
      // Get total submissions
      const { count: totalSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true });

      // Get pending submissions
      const { count: pendingSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get approved submissions
      const { count: approvedSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get rejected submissions
      const { count: rejectedSubmissions } = await supabase
        .from('task_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      return {
        total: totalSubmissions || 0,
        pending: pendingSubmissions || 0,
        approved: approvedSubmissions || 0,
        rejected: rejectedSubmissions || 0,
      };
    } catch (error) {
      console.error('Error getting submission stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };
    }
  }
};