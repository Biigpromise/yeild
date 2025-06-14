
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminCommunicationService, SupportTicket, MessageTemplate } from "@/services/admin/adminCommunicationService";
import { MessageSquare, Send, Template, Users } from "lucide-react";

export const AdminCommunication = () => {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: ''
  });
  const [bulkMessage, setBulkMessage] = useState({
    subject: '',
    content: '',
    type: 'email' as 'email' | 'in_app'
  });

  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = async () => {
    try {
      const [tickets, templates] = await Promise.all([
        adminCommunicationService.getSupportTickets(),
        adminCommunicationService.getMessageTemplates()
      ]);
      
      setSupportTickets(tickets);
      setMessageTemplates(templates);
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketStatusUpdate = async (ticketId: string, status: string, assignedTo?: string) => {
    const success = await adminCommunicationService.updateTicketStatus(ticketId, status, assignedTo);
    if (success) {
      loadCommunicationData();
    }
  };

  const handleAddTicketResponse = async (ticketId: string, message: string) => {
    const success = await adminCommunicationService.addTicketResponse(ticketId, message);
    if (success) {
      loadCommunicationData();
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) return;
    
    const success = await adminCommunicationService.createMessageTemplate({
      ...newTemplate,
      isActive: true
    });
    
    if (success) {
      setNewTemplate({ name: '', subject: '', content: '', category: '' });
      loadCommunicationData();
    }
  };

  const handleSendBulkMessage = async () => {
    if (!bulkMessage.subject || !bulkMessage.content) return;
    
    // For demo purposes, sending to all users
    const recipients = ['all'];
    const success = await adminCommunicationService.sendBulkMessage(
      recipients, 
      bulkMessage.subject, 
      bulkMessage.content, 
      bulkMessage.type
    );
    
    if (success) {
      setBulkMessage({ subject: '', content: '', type: 'email' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading communication data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Pending support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportTickets.filter(t => t.status === 'in_progress').length}</div>
            <p className="text-xs text-muted-foreground">Being handled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Template className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Message templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportTickets.filter(t => t.priority === 'urgent').length}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Messaging</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>{ticket.userName}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {ticket.status === 'open' && (
                            <Button
                              size="sm"
                              onClick={() => handleTicketStatusUpdate(ticket.id, 'in_progress')}
                            >
                              Take
                            </Button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleTicketStatusUpdate(ticket.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
                <Input
                  placeholder="Subject"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                />
                <Input
                  placeholder="Category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                />
                <Textarea
                  placeholder="Message content"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  rows={4}
                />
                <Button onClick={handleCreateTemplate} className="w-full">
                  Create Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messageTemplates.map((template) => (
                    <div key={template.id} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{template.subject}</p>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Messaging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Message subject"
                  value={bulkMessage.subject}
                  onChange={(e) => setBulkMessage({...bulkMessage, subject: e.target.value})}
                />
                <Select
                  value={bulkMessage.type}
                  onValueChange={(value: 'email' | 'in_app') => setBulkMessage({...bulkMessage, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_app">In-App Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Message content"
                value={bulkMessage.content}
                onChange={(e) => setBulkMessage({...bulkMessage, content: e.target.value})}
                rows={6}
              />
              <Button onClick={handleSendBulkMessage} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send to All Users
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
