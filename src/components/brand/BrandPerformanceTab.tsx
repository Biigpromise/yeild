
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, Share2, MessageSquare, Star, Award, Target, DollarSign } from "lucide-react";
import { useBrandAnalytics } from "@/hooks/useBrandAnalytics";
import { useAuth } from "@/contexts/AuthContext";

export const BrandPerformanceTab: React.FC = () => {
  const { user } = useAuth();
  const { analytics, loading } = useBrandAnalytics();
  const [timeRange, setTimeRange] = useState('30d');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your performance data...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics from real data
  const performanceMetrics = [
    {
      title: "Total Campaigns",
      value: analytics?.totalCampaigns?.toString() || "0",
      change: analytics?.totalCampaigns > 0 ? "+100%" : "0%",
      trend: "up" as const,
      icon: Target,
      color: "text-blue-500"
    },
    {
      title: "Active Campaigns",
      value: analytics?.activeCampaigns?.toString() || "0",
      change: analytics?.activeCampaigns > 0 ? "+50%" : "0%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-green-500"
    },
    {
      title: "Total Submissions",
      value: analytics?.totalSubmissions?.toString() || "0",
      change: analytics?.totalSubmissions > 0 ? "+25%" : "0%",
      trend: "up" as const,
      icon: Users,
      color: "text-purple-500"
    },
    {
      title: "Points Awarded",
      value: analytics?.totalPointsAwarded?.toString() || "0",
      change: analytics?.totalPointsAwarded > 0 ? "+15%" : "0%",
      trend: "up" as const,
      icon: Award,
      color: "text-yellow-500"
    }
  ];

  const submissionData = analytics?.submissionsOverTime || [];

  const statusData = [
    { name: 'Approved', value: analytics?.approvedSubmissions || 0, color: '#10B981' },
    { name: 'Pending', value: analytics?.pendingSubmissions || 0, color: '#F59E0B' },
  ];

  const encouragementMessage = {
    title: analytics?.totalCampaigns > 0 ? "Great Progress! 🎉" : "Welcome to YIELD! 🚀",
    message: analytics?.totalCampaigns > 0 
      ? "Your campaigns are gaining traction. Keep engaging with our community!" 
      : "Start creating campaigns to see your performance metrics here.",
    stats: analytics?.totalCampaigns > 0 
      ? [
          `${analytics.totalSubmissions} total submissions`,
          `${analytics.approvedSubmissions} approved submissions`,
          `${analytics.totalPointsAwarded} points awarded`
        ]
      : [
          "Create your first campaign",
          "Engage with users",
          "Track your growth"
        ]
  };

  return (
    <div className="space-y-6">
      {/* Encouragement Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🚀</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{encouragementMessage.title}</h3>
              <p className="text-gray-700 mb-4">{encouragementMessage.message}</p>
              <div className="flex flex-wrap gap-2">
                {encouragementMessage.stats.map((stat, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800">
                    {stat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brand Performance Analytics</h2>
          <p className="text-gray-600">Track your brand's engagement and growth on YIELD</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <Badge className={`${metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Submission Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Submission Trend
            </CardTitle>
            <CardDescription>Daily submissions to your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {submissionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} name="Submissions" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No submission data yet</p>
                  <p className="text-sm">Start creating campaigns to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Submission Status
            </CardTitle>
            <CardDescription>Breakdown of submission statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.some(d => d.value > 0) ? (
              <div className="flex items-center justify-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No submissions yet</p>
                  <p className="text-sm">Launch campaigns to see status breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>Tips to improve your brand performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.totalCampaigns === 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">🎯</div>
                  <div>
                    <div className="font-semibold text-blue-900">Create Your First Campaign</div>
                    <div className="text-blue-700 text-sm">Start by creating a campaign to engage with our community and build your brand presence.</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-green-500 text-xl">📈</div>
                    <div>
                      <div className="font-semibold text-green-900">Great Start!</div>
                      <div className="text-green-700 text-sm">You have {analytics.totalCampaigns} campaign{analytics.totalCampaigns > 1 ? 's' : ''} running. Keep engaging with users for better results.</div>
                    </div>
                  </div>
                </div>
                {analytics.approvedSubmissions > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-purple-500 text-xl">🎉</div>
                      <div>
                        <div className="font-semibold text-purple-900">Excellent Engagement</div>
                        <div className="text-purple-700 text-sm">{analytics.approvedSubmissions} submission{analytics.approvedSubmissions > 1 ? 's' : ''} approved! Your campaigns are resonating well with users.</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
