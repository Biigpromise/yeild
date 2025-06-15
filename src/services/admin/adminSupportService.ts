
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket } from '@/services/supportService';
import { toast } from 'sonner';

export type AdminSupportTicket = SupportTicket & {
  profiles: {
    name: string | null;
    email: string | null;
  } | null;
};

export const adminSupportService = {
  async getAllTickets(): Promise<AdminSupportTicket[]> {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { action: 'get_all_support_tickets' },
    });

    if (error) {
      console.error('Error fetching support tickets for admin:', error);
      toast.error('Failed to load support tickets.');
      return [];
    }
    
    return data || [];
  },
};
