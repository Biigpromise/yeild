
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandCampaignsManager } from "./BrandCampaignsManager";

export const BrandCampaignsTab: React.FC = () => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Campaigns</CardTitle>
        <CardDescription>Monitor and manage all brand campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <BrandCampaignsManager />
      </CardContent>
    </Card>
  );
};
