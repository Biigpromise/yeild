
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const BrandPerformanceTab: React.FC = () => {
  const topBrands = [
    { name: "TechFlow Solutions", engagement: "287%", reach: "150K", satisfaction: "4.9", tier: "Enterprise" },
    { name: "GreenLife Wellness", engagement: "450%", reach: "200K", satisfaction: "4.8", tier: "Growth" },
    { name: "Urban Style Co.", engagement: "320%", reach: "120K", satisfaction: "4.7", tier: "Growth" },
    { name: "FitTech Pro", engagement: "234%", reach: "95K", satisfaction: "4.6", tier: "Starter" },
  ];

  const platformStats = [
    { metric: "Total Brand Revenue", value: "$247K", growth: "+23%" },
    { metric: "Active Brands", value: "89", growth: "+12%" },
    { metric: "Avg Campaign ROI", value: "5.2x", growth: "+18%" },
    { metric: "Brand Retention", value: "94%", growth: "+2%" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Overall brand performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.metric}</div>
                <div className="text-xs text-green-600 font-medium">{stat.growth}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Brands</CardTitle>
          <CardDescription>Brands with highest engagement and satisfaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBrands.map((brand, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{brand.name}</div>
                  <div className="text-sm text-gray-600">{brand.tier} Plan</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-bold text-green-600">+{brand.engagement}</div>
                    <div className="text-xs text-gray-500">Engagement</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{brand.reach}</div>
                    <div className="text-xs text-gray-500">Reach</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-600">{brand.satisfaction}/5</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
