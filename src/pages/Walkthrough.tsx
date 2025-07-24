
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Walkthrough: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Walkthrough</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Walkthrough page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Walkthrough;
