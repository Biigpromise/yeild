
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Notifications page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
