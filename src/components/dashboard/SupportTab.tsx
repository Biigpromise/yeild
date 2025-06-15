
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supportService, SupportTicket } from '@/services/supportService';
import { SupportTicketForm } from './SupportTicketForm';
import { SupportTicketList } from './SupportTicketList';
import { LoadingState } from '@/components/ui/loading-state';

export const SupportTab = () => {
  const queryClient = useQueryClient();

  const { data: tickets, isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['supportTickets'],
    queryFn: supportService.getUserTickets,
  });

  const handleTicketCreated = () => {
    refetch();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Ticket</CardTitle>
            <CardDescription>
              Having an issue? Let us know and we'll get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupportTicketForm onTicketCreated={handleTicketCreated} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>
              Here's a list of your past and current support tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState text="Loading your tickets..." />
            ) : (
              <SupportTicketList tickets={tickets || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
