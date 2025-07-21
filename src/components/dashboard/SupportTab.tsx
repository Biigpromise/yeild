
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, FileText, Mail } from 'lucide-react';

export const SupportTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support & Help
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium mb-2">Live Chat</h4>
                <p className="text-sm text-muted-foreground mb-3">Get instant help from our support team</p>
                <Button size="sm" className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium mb-2">FAQ</h4>
                <p className="text-sm text-muted-foreground mb-3">Find answers to common questions</p>
                <Button variant="outline" size="sm" className="w-full">View FAQ</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-medium mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-3">Contact us via email</p>
                <Button variant="outline" size="sm" className="w-full">Send Email</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <HelpCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <h4 className="font-medium mb-2">Tutorials</h4>
                <p className="text-sm text-muted-foreground mb-3">Learn how to use YIELD</p>
                <Button variant="outline" size="sm" className="w-full">Watch Tutorials</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
