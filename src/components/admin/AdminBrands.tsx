
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { BrandApplicationsTable } from "./brands/BrandApplicationsTable";
import { BrandCampaignsTab } from "./brands/BrandCampaignsTab";
import { BrandPerformanceTab } from "./brands/BrandPerformanceTab";
import { useBrandApplications, type BrandApplication } from "@/hooks/useBrandApplications";

export const AdminBrands = () => {
  const { applications, loading, handleUpdateStatus } = useBrandApplications();

  if (loading) {
    return <LoadingState text="Loading brand applications..." />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="applications">
        <TabsList className="mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Brand Applications</CardTitle>
              <CardDescription>
                Review and manage new brand partnership requests. 
                {applications.length > 0 && ` (${applications.length} total applications)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandApplicationsTable 
                applications={applications}
                onUpdateStatus={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <BrandCampaignsTab />
        </TabsContent>
        
        <TabsContent value="performance">
          <BrandPerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
