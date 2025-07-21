
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { analytics } from '@/services/analytics';
import { useAuth } from '@/contexts/AuthContext';

export const AnalyticsVerification: React.FC = () => {
  const { user } = useAuth();
  const [verificationResults, setVerificationResults] = useState<{
    ga4: 'pending' | 'success' | 'error';
    gtm: 'pending' | 'success' | 'error';
    dataLayer: 'pending' | 'success' | 'error';
  }>({
    ga4: 'pending',
    gtm: 'pending',
    dataLayer: 'pending'
  });

  const runVerification = () => {
    // Check if GA4 is loaded
    const ga4Status = typeof window !== 'undefined' && window.gtag ? 'success' : 'error';
    
    // Check if GTM is loaded
    const gtmStatus = typeof window !== 'undefined' && window.dataLayer ? 'success' : 'error';
    
    // Check if dataLayer is working
    const dataLayerStatus = typeof window !== 'undefined' && 
      window.dataLayer && 
      Array.isArray(window.dataLayer) ? 'success' : 'error';

    setVerificationResults({
      ga4: ga4Status,
      gtm: gtmStatus,
      dataLayer: dataLayerStatus
    });

    // Test analytics event
    if (user) {
      analytics.trackEvent({
        event_name: 'analytics_verification_test',
        event_category: 'testing',
        event_label: 'verification_component',
        user_id: user.id
      });
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Analytics Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationResults.ga4)}
              <span className="font-medium">Google Analytics 4</span>
            </div>
            {getStatusBadge(verificationResults.ga4)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationResults.gtm)}
              <span className="font-medium">Google Tag Manager</span>
            </div>
            {getStatusBadge(verificationResults.gtm)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {getStatusIcon(verificationResults.dataLayer)}
              <span className="font-medium">Data Layer</span>
            </div>
            {getStatusBadge(verificationResults.dataLayer)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runVerification} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Verification
          </Button>
          <Button 
            onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
            variant="outline"
          >
            Open GA4 Real-Time
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Make sure you've replaced the placeholder IDs in index.html with your actual GA4 and GTM IDs before running verification.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
