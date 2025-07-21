
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeclinedTaskEdit = () => {
  const [isEditing, setIsEditing] = useState(false);

  const canEditTask = (taskSubmission: any) => {
    return taskSubmission && taskSubmission.status === 'rejected';
  };

  const resubmitTask = async (submissionId: string, newEvidence: string, newFiles?: string[]) => {
    setIsEditing(true);
    
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({
          evidence: newEvidence,
          file_urls: newFiles || [],
          status: 'pending',
          submitted_at: new Date().toISOString(),
          rejection_reason: null
        })
        .eq('id', submissionId);

      if (error) {
        throw error;
      }

      toast.success('Task resubmitted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error resubmitting task:', error);
      toast.error('Failed to resubmit task. Please try again.');
      return { success: false, error };
    } finally {
      setIsEditing(false);
    }
  };

  const getDeclineReason = async (submissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('rejection_reason')
        .eq('id', submissionId)
        .single();

      if (error) {
        throw error;
      }

      return data?.rejection_reason || 'No reason provided';
    } catch (error) {
      console.error('Error fetching decline reason:', error);
      return 'Unable to fetch decline reason';
    }
  };

  return {
    isEditing,
    canEditTask,
    resubmitTask,
    getDeclineReason
  };
};
