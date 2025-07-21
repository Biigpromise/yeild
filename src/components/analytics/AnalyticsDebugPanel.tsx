
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, RefreshCw, ExternalLink } from 'lucide-react';

export const AnalyticsDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [dataLayerEvents, setDataLayerEvents] = useState<any[]>([]);

  const collectDebugInfo = () => {
    const info = {
      ga4: {
        loaded: typeof window !== 'undefined' && !!window.gtag,
        measurementId: 'G-E8XEF9FWZR',
        config: window.gtag ? 'Available' : 'Not Available'
      },
      gtm: {
        loaded: typeof window !== 'undefined' && !!window.dataLayer,
        containerId: 'GTM-KNMLZ7MQ',
        dataLayerLength: window.dataLayer ? window.dataLayer.length : 0
      },
      browser: {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'Not set'
      }
    };

    setDebugInfo(info);

    // Capture recent dataLayer events
    if (window.dataLayer) {
      setDataLayerEvents(window.dataLayer.slice(-10));
    }
  };

  useEffect(() => {
    collectDebugInfo();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Technical details and debugging information
          </p>
          <Button onClick={collectDebugInfo} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Google Analytics 4</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={debugInfo.ga4.loaded ? 'default' : 'destructive'}>
                    {debugInfo.ga4.loaded ? 'Loaded' : 'Not Loaded'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Measurement ID:</span>
                  <code className="text-xs">{debugInfo.ga4.measurementId}</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Google Tag Manager</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={debugInfo.gtm.loaded ? 'default' : 'destructive'}>
                    {debugInfo.gtm.loaded ? 'Loaded' : 'Not Loaded'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Container ID:</span>
                  <code className="text-xs">{debugInfo.gtm.containerId}</code>
                </div>
                <div className="flex justify-between">
                  <span>DataLayer Events:</span>
                  <span>{debugInfo.gtm.dataLayerLength}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Recent DataLayer Events</h4>
              <ScrollArea className="h-32 w-full border rounded p-2">
                <div className="space-y-1">
                  {dataLayerEvents.map((event, index) => (
                    <div key={index} className="text-xs">
                      <code className="bg-muted p-1 rounded text-xs">
                        {JSON.stringify(event, null, 2)}
                      </code>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://analytics.google.com/analytics/web/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            GA4 Real-Time
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open('https://tagmanager.google.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            GTM Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
