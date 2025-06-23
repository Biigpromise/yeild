
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  Download,
  Filter
} from "lucide-react";

export const BrandAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // Mock analytics data
  const analyticsData = {
    totalImpressions: 245000,
    totalClicks: 8500,
    totalConversions: 312,
    clickThroughRate: 3.47,
    conversionRate: 3.67,
    averageCPC: 0.85,
    totalSpend: 7225,
    roi: 245
  };

  const brandPerformance = [
    { brand: "TechCorp", impressions: 95000, clicks: 3200, conversions: 125, spend: 2720 },
    { brand: "FashionHub", impressions: 78000, clicks: 2800, conversions: 98, spend: 2380 },
    { brand: "GadgetStore", impressions: 72000, clicks: 2500, conversions: 89, spend: 2125 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Brand Analytics</h2>
          <p className="text-muted-foreground">Comprehensive performance insights and reporting</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{analyticsData.totalImpressions.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                <p className="text-2xl font-bold">{analyticsData.clickThroughRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.conversionRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.8% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return on Investment</p>
                <p className="text-2xl font-bold">{analyticsData.roi}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18.3% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brands">Brand Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Analysis</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Clicks</span>
                    <span className="font-medium">{analyticsData.totalClicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Conversions</span>
                    <span className="font-medium">{analyticsData.totalConversions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average CPC</span>
                    <span className="font-medium">${analyticsData.averageCPC}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Spend</span>
                    <span className="font-medium">${analyticsData.totalSpend.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Highest CTR: 4.2% (TechCorp)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Best Conversion Rate: 4.1% (GadgetStore)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Lowest CPC: $0.72 (FashionHub)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Highest ROI: 280% (TechCorp)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Brand Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Brand</th>
                      <th className="text-left p-2">Impressions</th>
                      <th className="text-left p-2">Clicks</th>
                      <th className="text-left p-2">CTR</th>
                      <th className="text-left p-2">Conversions</th>
                      <th className="text-left p-2">Conversion Rate</th>
                      <th className="text-left p-2">Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandPerformance.map((brand, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{brand.brand}</td>
                        <td className="p-2">{brand.impressions.toLocaleString()}</td>
                        <td className="p-2">{brand.clicks.toLocaleString()}</td>
                        <td className="p-2">{((brand.clicks / brand.impressions) * 100).toFixed(2)}%</td>
                        <td className="p-2">{brand.conversions}</td>
                        <td className="p-2">{((brand.conversions / brand.clicks) * 100).toFixed(2)}%</td>
                        <td className="p-2">${brand.spend.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed campaign analysis charts and insights will be displayed here.</p>
                <p className="text-sm mt-2">This section will include performance trends, cost analysis, and optimization recommendations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Audience demographic data and insights will be displayed here.</p>
                <p className="text-sm mt-2">This section will include age groups, geographic distribution, and behavioral patterns.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
