
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandCampaignsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Management</CardTitle>
        <CardDescription>Create and manage brand campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Campaigns Coming Soon</h3>
          <p className="text-muted-foreground">Campaign management features are under development</p>
        </div>
      </CardContent>
    </Card>
  );
};
