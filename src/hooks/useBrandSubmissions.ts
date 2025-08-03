import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BrandSubmission {
  id: string;
  task_id: string;
  user_id: string;
  submitted_at: string;
  status: string;
  evidence: string;
  evidence_file_url: string;
  calculated_points: number;
  admin_notes: string;
  tasks: {
    title: string;
    points: number;
  } | null;
  profiles: {
    name: string;
    profile_picture_url: string;
  } | null;
}

export const useBrandSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<BrandSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch submissions for tasks created by this brand
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!inner(
            title,
            points,
            brand_user_id
          ),
          profiles(
            name,
            profile_picture_url
          )
        `)
        .eq('tasks.brand_user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setSubmissions((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching brand submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const approveSubmission = useCallback(async (submissionId: string) => {
    try {
      // Get submission details first
      const { data: submission, error: fetchError } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks(
            points,
            brand_user_id
          )
        `)
        .eq('id', submissionId)
        .single();

      if (fetchError) throw fetchError;

      // Verify this submission belongs to a task from this brand
      if (submission.tasks.brand_user_id !== user?.id) {
        toast.error('Unauthorized action');
        return;
      }

      // Update submission status
      const { error: updateError } = await supabase
        .from('task_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          calculated_points: submission.tasks.points
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      toast.success('Submission approved and user will be paid!');
      await fetchSubmissions();
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    }
  }, [user, fetchSubmissions]);

  const rejectSubmission = useCallback(async (submissionId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          admin_notes: reason
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission rejected');
      await fetchSubmissions();
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    }
  }, [user, fetchSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    approveSubmission,
    rejectSubmission,
    refreshSubmissions: fetchSubmissions,
  };
};