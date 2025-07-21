
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MousePointer, DollarSign, Activity, Calendar, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

interface EventData {
  event: string;
  count: number;
  percentage: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    { name: 'Page Views', value: 1234, change: 12.5, changeType: 'increase' },
    { name: 'Active Users', value: 567, change: -2.3, changeType: 'decrease' },
    { name: 'Social Interactions', value: 890, change: 8.7, changeType: 'increase' },
    { name: 'Task Completions', value: 234, change: 15.2, changeType: 'increase' },
  ]);

  const [chartData] = useState([
    { date: '2024-01-01', pageViews: 400, users: 240, interactions: 120 },
    { date: '2024-01-02', pageViews: 300, users: 139, interactions: 180 },
    { date: '2024-01-03', pageViews: 200, users: 980, interactions: 190 },
    { date: '2024-01-04', pageViews: 278, users: 390, interactions: 200 },
    { date: '2024-01-05', pageViews: 189, users: 480, interactions: 181 },
    { date: '2024-01-06', pageViews: 239, users: 380, interactions: 250 },
    { date: '2024-01-07', pageViews: 349, users: 430, interactions: 210 },
  ]);

  const [eventData] = useState<EventData[]>([
    { event: 'Page View', count: 1234, percentage: 45 },
    { event: 'Social Interaction', count: 567, percentage: 20 },
    { event: 'Task Completion', count: 234, percentage: 15 },
    { event: 'User Registration', count: 123, percentage: 10 },
    { event: 'Campaign Creation', count: 89, percentage: 10 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const openGoogleAnalytics = () => {
    window.open('https://analytics.google.com/analytics/web/#/p/your-property-id/reports/dashboard', '_blank');
  };

  const openGTM = () => {
    window.open('https://tagmanager.google.com/#/container/accounts/your-account-id/containers/your-container-id/workspaces/your-workspace-id', '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your app's performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openGoogleAnalytics}>
            <ExternalLink className="w-4 h-4 mr-2" />
            GA4 Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={openGTM}>
            <ExternalLink className="w-4 h-4 mr-2" />
            GTM Workspace
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="monetization">Monetization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className={`mr-1 h-3 w-3 ${
                      metric.changeType === 'increase' ? 'text-green-500' : 
                      metric.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={
                      metric.changeType === 'increase' ? 'text-green-600' : 
                      metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className="ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="pageViews" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="interactions" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {eventData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventData.map((event, index) => (
                    <div key={event.event} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{event.event}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{event.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{event.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">456</div>
                  <div className="text-sm text-blue-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">123</div>
                  <div className="text-sm text-green-600">Comments</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-purple-600">Shares</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monetization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monetization Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$1,234</div>
                  <div className="text-sm text-green-600">Total Earnings</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$567</div>
                  <div className="text-sm text-blue-600">Withdrawals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
