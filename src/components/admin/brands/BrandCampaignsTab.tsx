
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";

export const BrandCampaignsTab: React.FC = () => {
  const { campaigns, loading } = useBrandCampaigns();

  if (loading) {
    return <LoadingState text="Loading brand campaigns..." />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Campaign Management</CardTitle>
        <CardDescription>Monitor and manage all brand campaigns across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No brand campaigns found. Campaigns will appear here when brands create them.
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-semibold">{campaign.title}</div>
                  <div className="text-sm text-gray-600">
                    {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    ₦{campaign.budget.toLocaleString()}
                  </div>
                  {campaign.description && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {campaign.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={`${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                  {campaign.start_date && (
                    <div className="text-xs text-gray-500">
                      Start: {new Date(campaign.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
