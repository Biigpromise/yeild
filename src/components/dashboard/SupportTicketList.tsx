
import React from 'react';
import { SupportTicket } from '@/services/supportService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SupportTicketListProps {
  tickets: SupportTicket[];
}

export const SupportTicketList: React.FC<SupportTicketListProps> = ({ tickets }) => {
  const getStatusBadgeVariant = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You haven't submitted any support tickets yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                <CardDescription>
                  Submitted {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
