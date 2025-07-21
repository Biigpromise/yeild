
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { QuickSetup } from '@/components/navigation/QuickSetup';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const analytics = useAnalytics();

  const handleSignOut = async () => {
    await signOut();
  };

  const testAnalytics = () => {
    analytics.trackSocialInteraction('like', 'test-post-123');
    analytics.trackEarning(50, 'task_completion');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">YEILD Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.user_metadata?.name || user?.email}!
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your YEILD platform is ready! Complete the analytics setup to start tracking user engagement and platform performance.
                </p>
                <div className="flex gap-2">
                  <Button onClick={testAnalytics} variant="outline">
                    Test Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <QuickSetup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
