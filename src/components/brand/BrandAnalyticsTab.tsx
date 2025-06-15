
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandAnalyticsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Analytics</CardTitle>
        <CardDescription>Analyze the performance of your campaigns.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground">Detailed campaign analytics are under development.</p>
        </div>
      </CardContent>
    </Card>
  );
};
