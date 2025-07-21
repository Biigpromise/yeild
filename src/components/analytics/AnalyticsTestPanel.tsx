
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import { analytics } from '@/services/analytics';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const AnalyticsTestPanel: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAnalyticsTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Page View Tracking
    try {
      analytics.trackPageView('test_page', user?.id || 'anonymous', user?.user_metadata?.user_type || 'test_user');
      results.push({
        name: 'Page View Tracking',
        status: 'success',
        message: 'Page view event sent successfully'
      });
    } catch (error) {
      results.push({
        name: 'Page View Tracking',
        status: 'error',
        message: 'Failed to send page view event'
      });
    }

    // Test 2: Custom Event Tracking
    try {
      analytics.trackEvent({
        event_name: 'analytics_test',
        event_category: 'testing',
        event_label: 'verification_test',
        user_id: user?.id || 'anonymous'
      });
      results.push({
        name: 'Custom Event Tracking',
        status: 'success',
        message: 'Custom event sent successfully'
      });
    } catch (error) {
      results.push({
        name: 'Custom Event Tracking',
        status: 'error',
        message: 'Failed to send custom event'
      });
    }

    // Test 3: User Login Tracking (only if user is logged in)
    try {
      if (user) {
        analytics.trackLogin(user.id, user.user_metadata?.user_type || 'user', 'email');
        results.push({
          name: 'User Login Tracking',
          status: 'success',
          message: 'Login event sent successfully'
        });
      } else {
        results.push({
          name: 'User Login Tracking',
          status: 'success',
          message: 'Skipped - no user session (this is normal for testing)'
        });
      }
    } catch (error) {
      results.push({
        name: 'User Login Tracking',
        status: 'error',
        message: 'Failed to send login event'
      });
    }

    // Test 4: Social Interaction Tracking
    try {
      analytics.trackSocialInteraction(user?.id || 'anonymous', 'like', 'test_post_123');
      results.push({
        name: 'Social Interaction Tracking',
        status: 'success',
        message: 'Social interaction event sent successfully'
      });
    } catch (error) {
      results.push({
        name: 'Social Interaction Tracking',
        status: 'error',
        message: 'Failed to send social interaction event'
      });
    }

    // Test 5: Earnings Tracking
    try {
      analytics.trackEarning(user?.id || 'anonymous', 100, 'test_task');
      results.push({
        name: 'Earnings Tracking',
        status: 'success',
        message: 'Earnings event sent successfully'
      });
    } catch (error) {
      results.push({
        name: 'Earnings Tracking',
        status: 'error',
        message: 'Failed to send earnings event'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Analytics Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Test all analytics tracking functions {!user && '(running as anonymous user)'}
          </p>
          <Button 
            onClick={runAnalyticsTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {!user && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> You're not logged in, so some tests will run as anonymous user. This is normal for testing the analytics setup.
            </AlertDescription>
          </Alert>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium">{result.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground mt-2">
              <p>Tests completed. Check results above for status of each analytics function.</p>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Check your GA4 Real-Time reports to verify these events are being received.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
