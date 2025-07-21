
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandPerformanceTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Performance</CardTitle>
        <CardDescription>Track and analyze brand campaign performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
          <p className="text-muted-foreground">Brand performance analytics are under development</p>
        </div>
      </CardContent>
    </Card>
  );
};
