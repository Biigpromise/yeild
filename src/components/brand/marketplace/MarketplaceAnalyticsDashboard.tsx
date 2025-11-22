import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Eye, MousePointerClick, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { marketplaceService } from "@/services/marketplaceService";

export function MarketplaceAnalyticsDashboard() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['marketplace-analytics', listingId, dateRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      return marketplaceService.getListingAnalyticsDetailed(
        listingId!,
        startDate,
        endDate
      );
    },
    enabled: !!listingId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dailyStats = analytics?.dailyStats || [];
  const totalStats = analytics?.totalStats || { totalViews: 0, totalClicks: 0, avgCTR: 0 };
  const comparison = analytics?.categoryComparison || { yourCTR: 0, categoryAvgCTR: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/brand-dashboard/marketplace')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Listing Analytics</h2>
            <p className="text-muted-foreground">Track your listing performance</p>
          </div>
        </div>

        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dailyStats.length > 0 ? `~${Math.round(totalStats.totalViews / dailyStats.length)} per day` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dailyStats.length > 0 ? `~${Math.round(totalStats.totalClicks / dailyStats.length)} per day` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgCTR.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Category avg: {comparison.categoryAvgCTR.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Views & Clicks Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views & Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toLocaleString(), '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  name="Views"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="hsl(var(--chart-2))" 
                  name="Clicks"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTR Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Click-Through Rate by Day</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  label={{ value: 'CTR (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'CTR']}
                />
                <Bar 
                  dataKey="ctr" 
                  fill="hsl(var(--primary))" 
                  name="CTR"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Your CTR</span>
                <span className="text-sm font-bold">{comparison.yourCTR.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(comparison.yourCTR, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Category Average</span>
                <span className="text-sm font-bold">{comparison.categoryAvgCTR.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-muted-foreground h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(comparison.categoryAvgCTR, 100)}%` }}
                />
              </div>
            </div>

            {comparison.yourCTR > comparison.categoryAvgCTR ? (
              <p className="text-sm text-green-600">
                🎉 Your listing is performing {((comparison.yourCTR / comparison.categoryAvgCTR - 1) * 100).toFixed(1)}% better than the category average!
              </p>
            ) : comparison.yourCTR < comparison.categoryAvgCTR ? (
              <p className="text-sm text-muted-foreground">
                Your listing is performing {((1 - comparison.yourCTR / comparison.categoryAvgCTR) * 100).toFixed(1)}% below the category average. Consider improving your title, description, or images.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your listing is performing at the category average.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
