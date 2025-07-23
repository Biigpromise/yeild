import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  type: 'user_registration' | 'task_submission' | 'payment_processed' | 'task_approved';
  title: string;
  description: string;
  timestamp: string;
  color: string;
}

export const useRecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activities: Activity[] = [];

        // Get recent user registrations
        const { data: newUsers } = await supabase
          .from('profiles')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        newUsers?.forEach(user => {
          activities.push({
            id: `user_${user.id}`,
            type: 'user_registration',
            title: 'New user registration',
            description: `${user.name || 'Anonymous User'} joined`,
            timestamp: user.created_at,
            color: 'bg-green-500'
          });
        });

        // Get recent task submissions
        const { data: submissions } = await supabase
          .from('task_submissions')
          .select('id, status, submitted_at, user_id')
          .order('submitted_at', { ascending: false })
          .limit(3);

        submissions?.forEach(submission => {
          activities.push({
            id: `submission_${submission.id}`,
            type: 'task_submission',
            title: 'Task submitted for review',
            description: `By user ${submission.user_id}`,
            timestamp: submission.submitted_at,
            color: 'bg-blue-500'
          });
        });

        // Get recent payments
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('id, amount, created_at, customer_name')
          .eq('status', 'successful')
          .order('created_at', { ascending: false })
          .limit(3);

        payments?.forEach(payment => {
          activities.push({
            id: `payment_${payment.id}`,
            type: 'payment_processed',
            title: 'Payment processed',
            description: `₦${payment.amount} from ${payment.customer_name}`,
            timestamp: payment.created_at,
            color: 'bg-yellow-500'
          });
        });

        // Sort all activities by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivities(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, loading };
};