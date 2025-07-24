
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TaskSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Task submission page coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskSubmissionPage;
