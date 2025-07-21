
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsStatus } from '@/components/analytics/AnalyticsStatus';
import { AnalyticsTestPanel } from '@/components/analytics/AnalyticsTestPanel';
import { AnalyticsDebugPanel } from '@/components/analytics/AnalyticsDebugPanel';

export const AnalyticsVerification: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analytics Verification</h2>
        <p className="text-muted-foreground">
          Test and verify your analytics implementation
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <AnalyticsStatus />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <AnalyticsTestPanel />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <AnalyticsDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
