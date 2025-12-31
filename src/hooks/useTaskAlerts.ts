import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NewTask {
  id: string;
  title: string;
  points: number;
  created_at: string;
}

export const useTaskAlerts = () => {
  const { user } = useAuth();
  const [newTaskCount, setNewTaskCount] = useState(0);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string | null>(null);

  // Get last seen timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lastSeenTaskTimestamp');
    if (stored) {
      setLastSeenTimestamp(stored);
    } else {
      // If no stored timestamp, use current time
      const now = new Date().toISOString();
      localStorage.setItem('lastSeenTaskTimestamp', now);
      setLastSeenTimestamp(now);
    }
  }, []);

  // Count unseen tasks
  useEffect(() => {
    const countNewTasks = async () => {
      if (!lastSeenTimestamp) return;

      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gt('created_at', lastSeenTimestamp);

      if (!error && count) {
        setNewTaskCount(count);
      }
    };

    countNewTasks();
  }, [lastSeenTimestamp]);

  // Subscribe to new tasks
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('new-tasks-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          const newTask = payload.new as NewTask;
          
          // Only notify for active tasks
          if (newTask && (payload.new as any).status === 'active') {
            setNewTaskCount(prev => prev + 1);
            
            // Show toast notification
            toast.success(
              `🎯 New task available!`,
              {
                description: `"${newTask.title}" - Earn ${newTask.points || 0} points`,
                duration: 5000,
                action: {
                  label: 'View',
                  onClick: () => {
                    window.location.href = `/tasks/${newTask.id}`;
                  }
                }
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Mark tasks as seen
  const markTasksAsSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('lastSeenTaskTimestamp', now);
    setLastSeenTimestamp(now);
    setNewTaskCount(0);
  }, []);

  return {
    newTaskCount,
    markTasksAsSeen,
    hasNewTasks: newTaskCount > 0
  };
};
