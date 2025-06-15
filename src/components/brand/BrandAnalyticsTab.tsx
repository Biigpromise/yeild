
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrandAnalytics } from "@/hooks/useBrandAnalytics";
import { LoadingState } from "@/components/ui/loading-state";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, CheckCircle, Clock, Award, FileText } from "lucide-react";

export const BrandAnalyticsTab: React.FC = () => {
  const { analytics, loading } = useBrandAnalytics();

  if (loading) {
    return <LoadingState text="Loading analytics..." />;
  }

  if (!analytics || analytics.totalCampaigns === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">Create a campaign to start seeing analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { title: "Total Campaigns", value: analytics.totalCampaigns, icon: FileText },
    { title: "Active Campaigns", value: analytics.activeCampaigns, icon: Target },
    { title: "Total Submissions", value: analytics.totalSubmissions, icon: CheckCircle },
    { title: "Pending Submissions", value: analytics.pendingSubmissions, icon: Clock },
    { title: "Total Points Awarded", value: analytics.totalPointsAwarded, icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Submissions over last 7 days</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.submissionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
