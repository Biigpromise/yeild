
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { analytics } from '@/services/analytics';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    totalSignups: 0,
    activeUsers: 0,
    taskCompletions: 0,
    brandAccounts: 0
  });

  useEffect(() => {
    // In a real implementation, this would fetch from GA4 API
    // For now, we'll use placeholder data
    setAnalyticsData({
      totalUsers: 25,
      totalSignups: 8,
      activeUsers: 12,
      taskCompletions: 3,
      brandAccounts: 2
    });
  }, []);

  const chartData = [
    { name: 'Mon', signups: 2, logins: 8 },
    { name: 'Tue', signups: 1, logins: 12 },
    { name: 'Wed', signups: 3, logins: 15 },
    { name: 'Thu', signups: 2, logins: 10 },
    { name: 'Fri', signups: 0, logins: 8 },
    { name: 'Sat', signups: 1, logins: 6 },
    { name: 'Sun', signups: 1, logins: 9 }
  ];

  const testAnalytics = () => {
    if (user) {
      // Test various analytics events
      analytics.trackEvent({
        event_name: 'test_event',
        event_category: 'testing',
        event_label: 'dashboard_test',
        user_id: user.id
      });
      
      analytics.trackPageView('analytics_dashboard', user.id, user.user_metadata?.user_type);
      
      console.log('Test analytics events fired');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Button onClick={testAnalytics} variant="outline" size="sm">
          Test Analytics
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSignups}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.taskCompletions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brand Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.brandAccounts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="signups" fill="#8884d8" name="Signups" />
                <Bar dataKey="logins" fill="#82ca9d" name="Logins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="signups" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Google Analytics 4</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Google Tag Manager</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Authentication Tracking</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Page View Tracking</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Custom Event Tracking</span>
              <span className="text-green-600">✓ Implemented</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Google Analytics 4 Setup</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to <a href="https://analytics.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics</a></li>
                <li>Create a new GA4 property for your domain</li>
                <li>Copy the Measurement ID and replace 'GA_MEASUREMENT_ID' in index.html</li>
                <li>Set up enhanced ecommerce tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. Google Tag Manager Setup</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to <a href="https://tagmanager.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Tag Manager</a></li>
                <li>Create a new container for your website</li>
                <li>Copy the Container ID and replace 'GTM-PLACEHOLDER' in index.html</li>
                <li>Configure GA4 tag through GTM</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Google Search Console Setup</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Go to <a href="https://search.google.com/search-console" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Search Console</a></li>
                <li>Add and verify your domain property</li>
                <li>Submit your XML sitemap</li>
                <li>Monitor organic search performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
