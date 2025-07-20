
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandCampaignsTab: React.FC = () => {
  const campaigns = [
    { id: 1, brand: "TechFlow Solutions", title: "Product Launch Campaign", budget: "$5,000", status: "Active", performance: "+287% engagement" },
    { id: 2, brand: "GreenLife Wellness", title: "Brand Awareness Drive", budget: "$3,200", status: "Completed", performance: "+450% reach" },
    { id: 3, brand: "Urban Style Co.", title: "Summer Collection Promo", budget: "$7,500", status: "Active", performance: "+320% sales" },
    { id: 4, brand: "FitTech Pro", title: "Influencer Partnership", budget: "$2,800", status: "Pending", performance: "In Review" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Campaign Management</CardTitle>
        <CardDescription>Monitor and manage all brand campaigns across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-semibold">{campaign.title}</div>
                <div className="text-sm text-gray-600">{campaign.brand}</div>
                <div className="text-sm text-green-600 font-medium">{campaign.budget}</div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.status}
                </div>
                <div className="text-sm text-gray-600 mt-1">{campaign.performance}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
