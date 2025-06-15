
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { adminSupportService, AdminSupportTicket } from "@/services/admin/adminSupportService";
import { formatDistanceToNow } from "date-fns";

export const AdminSupport = () => {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const fetchedTickets = await adminSupportService.getAllTickets();
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const getStatusBadgeVariant = (status: AdminSupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingState text="Loading support tickets..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tickets">
        <TabsList className="mb-6">
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage user support requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Input placeholder="Search tickets..." className="max-w-sm" />
                <div className="flex gap-2">
                  <select className="h-10 border border-input rounded-md px-3">
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.length > 0 ? (
                      tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-mono text-xs">{ticket.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{ticket.subject}</TableCell>
                          <TableCell>{ticket.profiles?.name || ticket.profiles?.email || ticket.user_id}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</TableCell>
                          <TableCell>{formatDistanceToNow(new Date(ticket.updated_at), { addSuffix: true })}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No support tickets found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Management</CardTitle>
              <CardDescription>Manage frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">FAQ Management Coming Soon</h3>
                <p className="text-muted-foreground">FAQ management features are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Review and analyze user feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">Feedback System Coming Soon</h3>
                <p className="text-muted-foreground">User feedback features are under development</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
