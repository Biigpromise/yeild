import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, Share2, MessageSquare, Star, Award, Target } from "lucide-react";

export const BrandPerformanceTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const performanceMetrics = [
    {
      title: "Total Reach",
      value: "247K",
      change: "+23%",
      trend: "up",
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Engagement Rate",
      value: "12.8%",
      change: "+5.2%",
      trend: "up",
      icon: Heart,
      color: "text-pink-500"
    },
    {
      title: "Share Rate",
      value: "8.4%",
      change: "+2.1%",
      trend: "up",
      icon: Share2,
      color: "text-green-500"
    },
    {
      title: "Brand Sentiment",
      value: "94%",
      change: "+1.8%",
      trend: "up",
      icon: Star,
      color: "text-yellow-500"
    }
  ];

  const engagementData = [
    { month: 'Jan', engagement: 8.2, reach: 180 },
    { month: 'Feb', engagement: 9.1, reach: 195 },
    { month: 'Mar', engagement: 10.5, reach: 220 },
    { month: 'Apr', engagement: 11.8, reach: 235 },
    { month: 'May', engagement: 12.8, reach: 247 },
  ];

  const campaignData = [
    { name: 'Product Reviews', value: 35, color: '#3B82F6' },
    { name: 'Social Posts', value: 28, color: '#10B981' },
    { name: 'Testimonials', value: 20, color: '#F59E0B' },
    { name: 'Unboxing Videos', value: 17, color: '#EF4444' },
  ];

  const topPerformers = [
    { name: "Sarah K.", engagement: 94, followers: "12K", level: "Phoenix", avatar: "🔥" },
    { name: "Mike R.", engagement: 89, followers: "8.5K", level: "Eagle", avatar: "🦅" },
    { name: "Lisa M.", engagement: 87, followers: "6.2K", level: "Hawk", avatar: "🦅" },
    { name: "Tom B.", engagement: 85, followers: "5.8K", level: "Falcon", avatar: "🦅" },
  ];

  const encouragementMessage = {
    title: "Outstanding Performance! 🎉",
    message: "Your brand is in the top 15% of performers on YIELD! Your authentic engagement strategy is driving incredible results.",
    stats: [
      "340% better than industry average",
      "94% positive brand sentiment",
      "Growing 23% month over month"
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
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Engagement Trend
            </CardTitle>
            <CardDescription>Monthly engagement rate and reach</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="right" dataKey="reach" fill="#E5E7EB" name="Reach (K)" />
                <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={3} name="Engagement %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Campaign Performance
            </CardTitle>
            <CardDescription>Breakdown by campaign type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={campaignData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {campaignData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Brand Ambassadors
          </CardTitle>
          <CardDescription>Users driving the most engagement for your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{performer.avatar}</div>
                  <div>
                    <div className="font-semibold">{performer.name}</div>
                    <div className="text-sm text-gray-600">{performer.followers} followers • {performer.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{performer.engagement}%</div>
                  <div className="text-sm text-gray-600">Engagement</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Performance Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations to boost your brand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-xl">💡</div>
                <div>
                  <div className="font-semibold text-blue-900">Optimize for Video Content</div>
                  <div className="text-blue-700 text-sm">Unboxing videos show 34% higher engagement. Consider creating more video-focused campaigns.</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-green-500 text-xl">📈</div>
                <div>
                  <div className="font-semibold text-green-900">Peak Performance Time</div>
                  <div className="text-green-700 text-sm">Your content performs best between 2-4 PM. Schedule campaigns during these hours for maximum impact.</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-purple-500 text-xl">🎯</div>
                <div>
                  <div className="font-semibold text-purple-900">Audience Expansion</div>
                  <div className="text-purple-700 text-sm">Phoenix-level users show 89% completion rates. Consider targeting higher-tier users for premium campaigns.</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};