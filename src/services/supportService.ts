
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
};

export const supportService = {
  async createTicket(subject: string, message: string): Promise<SupportTicket | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to create a ticket.');
      return null;
    }

    const { data, error } = await supabase
      .from('customer_support_tickets')
      .insert({
        user_id: user.id,
        subject,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      toast.error('Failed to create support ticket.');
      return null;
    }
    
    toast.success('Support ticket created successfully!');
    return data as SupportTicket;
  },

  async getUserTickets(): Promise<SupportTicket[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('customer_support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      toast.error('Failed to fetch support tickets.');
      return [];
    }
    
    return (data as SupportTicket[]) || [];
  },
};
