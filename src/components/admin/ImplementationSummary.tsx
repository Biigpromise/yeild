import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';

export const ImplementationSummary: React.FC = () => {
  const completedFeatures = [
    {
      title: 'Forgot Password Functionality',
      description: 'Complete forgot password flow with email reset',
      status: 'completed'
    },
    {
      title: 'Campaign Creation with Logo Upload',
      description: 'Enhanced campaign creation with logo upload and currency conversion',
      status: 'completed'
    },
    {
      title: 'Campaign Deletion Fix',
      description: 'Fixed campaign deletion issue in brand dashboard',
      status: 'completed'
    },
    {
      title: 'Currency Conversion System',
      description: 'USD to NGN conversion with real-time rates (1:1500)',
      status: 'completed'
    },
    {
      title: 'Enhanced Brand Dashboard',
      description: 'Added Communications, Content, Notifications, and Submissions tabs',
      status: 'completed'
    },
    {
      title: 'Campaign Approval Workflow',
      description: 'Wallet funding requirement before admin submission',
      status: 'completed'
    },
    {
      title: 'Automatic Refund System',
      description: 'Auto-refund for rejected campaigns to brand wallets',
      status: 'completed'
    },
    {
      title: 'Admin Campaign Approval',
      description: 'Complete admin interface for reviewing and approving campaigns',
      status: 'completed'
    }
  ];

  const pendingFeatures = [
    {
      title: 'Flutterwave Live Mode',
      description: 'Configure live payment processing',
      status: 'pending',
      note: 'Requires live Flutterwave secret key configuration'
    },
    {
      title: 'Real-time Notifications',
      description: 'Enhanced notification system for campaign updates',
      status: 'pending'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">Implementation Progress</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          8/10 Features Complete
        </Badge>
      </div>

      {/* Completed Features */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Completed Features ({completedFeatures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedFeatures.map((feature, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{feature.title}</h4>
                  <p className="text-sm text-green-700">{feature.description}</p>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Features */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Remaining Features ({pendingFeatures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingFeatures.map((feature, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900">{feature.title}</h4>
                  <p className="text-sm text-yellow-700">{feature.description}</p>
                  {feature.note && (
                    <p className="text-xs text-yellow-600 mt-1">{feature.note}</p>
                  )}
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Implementation Notes */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            Key Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900">Campaign Workflow</h4>
              <p className="text-sm text-blue-700">
                Brands must now fund their wallet before submitting campaigns for approval. 
                The system automatically deducts campaign costs and processes refunds for rejections.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900">Currency Conversion</h4>
              <p className="text-sm text-purple-700">
                Real-time USD to NGN conversion at 1:1500 rate. Brands can pay in either currency 
                with automatic conversion handling.
              </p>
            </div>
            
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-medium text-indigo-900">Payment Security</h4>
              <p className="text-sm text-indigo-700">
                Flutterwave integration with test/live mode detection. All financial transactions 
                are tracked with full audit trails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};