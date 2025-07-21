
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const AnalyticsStatus: React.FC = () => {
  // Check analytics status
  const ga4Status = typeof window !== 'undefined' && window.gtag ? 'active' : 'inactive';
  const gtmStatus = typeof window !== 'undefined' && window.dataLayer ? 'active' : 'inactive';
  const dataLayerStatus = typeof window !== 'undefined' && 
    window.dataLayer && 
    Array.isArray(window.dataLayer) ? 'active' : 'inactive';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            {getStatusIcon(ga4Status)}
            <div>
              <p className="font-medium">Google Analytics 4</p>
              <p className="text-sm text-muted-foreground">Measurement ID: G-E8XEF9FWZR</p>
            </div>
          </div>
          {getStatusBadge(ga4Status)}
        </div>

        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            {getStatusIcon(gtmStatus)}
            <div>
              <p className="font-medium">Google Tag Manager</p>
              <p className="text-sm text-muted-foreground">Container ID: GTM-KNMLZ7MQ</p>
            </div>
          </div>
          {getStatusBadge(gtmStatus)}
        </div>

        <div className="flex items-center justify-between p-3 border rounded">
          <div className="flex items-center gap-2">
            {getStatusIcon(dataLayerStatus)}
            <div>
              <p className="font-medium">Data Layer</p>
              <p className="text-sm text-muted-foreground">Event tracking system</p>
            </div>
          </div>
          {getStatusBadge(dataLayerStatus)}
        </div>
      </CardContent>
    </Card>
  );
};
