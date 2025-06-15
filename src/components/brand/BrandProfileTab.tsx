
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandProfileTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile & Billing</CardTitle>
        <CardDescription>Manage your company profile and billing information.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Profile Management Coming Soon</h3>
          <p className="text-muted-foreground">Features to manage your profile and billing are under development.</p>
        </div>
      </CardContent>
    </Card>
  );
};
