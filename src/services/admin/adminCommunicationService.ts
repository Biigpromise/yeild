
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  isActive: boolean;
}

export const adminCommunicationService = {
  // Support ticket management
  async getSupportTickets(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
  }): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_support_tickets',
          data: filters
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return [];
    }
  },

  async updateTicketStatus(
    ticketId: string, 
    status: string, 
    assignedTo?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'update_ticket_status',
          data: { ticketId, status, assignedTo }
        }
      });

      if (error) throw error;
      toast.success('Ticket status updated');
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
      return false;
    }
  },

  async addTicketResponse(ticketId: string, message: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'add_ticket_response',
          data: { ticketId, message }
        }
      });

      if (error) throw error;
      toast.success('Response added');
      return true;
    } catch (error) {
      console.error('Error adding ticket response:', error);
      toast.error('Failed to add response');
      return false;
    }
  },

  // Message templates
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'get_message_templates'
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching message templates:', error);
      return [];
    }
  },

  async createMessageTemplate(template: Omit<MessageTemplate, 'id'>): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'create_message_template',
          data: template
        }
      });

      if (error) throw error;
      toast.success('Template created');
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return false;
    }
  },

  // Bulk messaging
  async sendBulkMessage(
    recipients: string[], 
    subject: string, 
    content: string, 
    type: 'email' | 'in_app'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { 
          operation: 'send_bulk_message',
          data: { recipients, subject, content, type }
        }
      });

      if (error) throw error;
      toast.success(`Bulk ${type} message sent to ${recipients.length} users`);
      return true;
    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast.error('Failed to send bulk message');
      return false;
    }
  }
};
