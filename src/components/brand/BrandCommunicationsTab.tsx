import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Send, CheckCircle, Clock } from 'lucide-react';

export const BrandCommunicationsTab: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');

  // Mock data - replace with real data from API
  const messages = [
    {
      id: '1',
      subject: 'Campaign Approval Request',
      message: 'Please review our latest campaign submission for approval.',
      timestamp: '2024-01-20T10:00:00Z',
      status: 'pending',
      fromAdmin: false,
    },
    {
      id: '2',
      subject: 'Re: Campaign Approval Request',
      message: 'Your campaign has been approved! You can now proceed with the launch.',
      timestamp: '2024-01-20T14:30:00Z',
      status: 'read',
      fromAdmin: true,
    },
  ];

  const handleSendMessage = () => {
    if (!subject.trim() || !newMessage.trim()) return;
    
    // TODO: Implement message sending
    console.log('Sending message:', { subject, message: newMessage });
    setSubject('');
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Communications</h2>
          <p className="text-muted-foreground">Message with admins and support team</p>
        </div>
      </div>

      {/* New Message Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSendMessage} disabled={!subject.trim() || !newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{message.subject}</h4>
                      <Badge variant={message.fromAdmin ? "default" : "secondary"}>
                        {message.fromAdmin ? 'Admin' : 'You'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {message.status === 'read' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};