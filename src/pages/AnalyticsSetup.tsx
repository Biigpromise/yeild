
import React from 'react';
import { AnalyticsSetupGuide } from '@/components/setup/AnalyticsSetupGuide';
import { AnalyticsVerification } from '@/components/setup/AnalyticsVerification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AnalyticsSetup: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="mt-6">
          <AnalyticsSetupGuide />
        </TabsContent>
        
        <TabsContent value="verification" className="mt-6">
          <AnalyticsVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsSetup;
