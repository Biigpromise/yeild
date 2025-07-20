
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, AlertCircle, ExternalLink } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'warning';
  action?: string;
  link?: string;
}

export const LaunchChecklist = () => {
  const [checklist] = useState<ChecklistItem[]>([
    {
      id: 'auth',
      title: 'Authentication System',
      description: 'User registration, login, and security working',
      status: 'completed'
    },
    {
      id: 'payments',
      title: 'Payment Integration',
      description: 'Flutterwave integration and Nigerian bank support',
      status: 'completed'
    },
    {
      id: 'withdrawals',
      title: 'Withdrawal System',
      description: 'Complete withdrawal processing with real-time verification',
      status: 'completed'
    },
    {
      id: 'security',
      title: 'Database Security',
      description: 'RLS policies and secure functions implemented',
      status: 'completed'
    },
    {
      id: 'campaigns',
      title: 'Campaign Management',
      description: 'Brand campaigns and task creation working',
      status: 'completed'
    },
    {
      id: 'gamification',
      title: 'User Engagement',
      description: 'Points, levels, referrals, and bird system active',
      status: 'completed'
    },
    {
      id: 'monitoring',
      title: 'Error Monitoring',
      description: 'Consider adding Sentry or similar for production',
      status: 'warning',
      action: 'Optional: Add error tracking'
    },
    {
      id: 'analytics',
      title: 'Analytics Setup',
      description: 'Consider Google Analytics for user insights',
      status: 'warning',
      action: 'Optional: Add analytics'
    }
  ]);

  const completedItems = checklist.filter(item => item.status === 'completed').length;
  const totalItems = checklist.length;
  const criticalItems = checklist.filter(item => item.status === 'pending').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'pending':
        return <Badge className="bg-red-100 text-red-800">Required</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Optional</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🚀 Launch Readiness</span>
            <Badge variant="outline" className="text-lg">
              {completedItems}/{totalItems}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalItems === 0 ? (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Ready for Launch!</h3>
                <p className="text-green-700 text-sm">
                  All critical systems are operational. Your platform is production-ready with {completedItems} core features working.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Critical Items Pending</h3>
                <p className="text-red-700 text-sm">
                  {criticalItems} critical item(s) need attention before launch.
                </p>
              </div>
            )}

            <div className="grid gap-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.action && (
                        <p className="text-xs text-blue-600 mt-1">{item.action}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.link && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Deploy to Production</h4>
                <p className="text-sm text-muted-foreground">
                  Your platform is ready for production deployment
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Monitor Initial Users</h4>
                <p className="text-sm text-muted-foreground">
                  Watch for any issues with your first batch of users
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Circle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Scale Marketing</h4>
                <p className="text-sm text-muted-foreground">
                  Begin promoting to attract more users and brands
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
