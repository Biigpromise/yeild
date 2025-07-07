import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BrandTask {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  points: number;
  expires_at: string;
  created_at: string;
  brand_name: string;
  social_media_links: any;
  submissions_count?: number;
  approved_count?: number;
  pending_count?: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  category: string;
  points: number;
  expires_at: string;
  requirements: string;
  social_media_platform: string;
  content_type: string;
  social_media_links: any;
}

export const useBrandTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<BrandTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch tasks created by this brand
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          task_submissions!inner(
            id,
            status
          )
        `)
        .eq('brand_user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Process the data to include submission counts
      const processedTasks = tasksData?.map(task => {
        const submissions = task.task_submissions || [];
        return {
          ...task,
          submissions_count: submissions.length,
          approved_count: submissions.filter((s: any) => s.status === 'approved').length,
          pending_count: submissions.filter((s: any) => s.status === 'pending').length,
        };
      }) || [];

      setTasks(processedTasks);
    } catch (error: any) {
      console.error('Error fetching brand tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          category: taskData.category,
          points: taskData.points,
          expires_at: taskData.expires_at,
          brand_user_id: user.id,
          brand_name: user.user_metadata?.company_name || 'Unknown Brand',
          social_media_links: {
            platform: taskData.social_media_platform,
            content_type: taskData.content_type,
            requirements: taskData.requirements,
          },
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Task created successfully!');
      await fetchTasks(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  }, [user, fetchTasks]);

  const updateTaskStatus = useCallback(async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .eq('brand_user_id', user?.id);

      if (error) throw error;

      toast.success(`Task ${status} successfully`);
      await fetchTasks();
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task');
    }
  }, [user, fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    createTask,
    updateTaskStatus,
    refreshTasks: fetchTasks,
  };
};