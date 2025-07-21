
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Copy, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GTMSetupGuide } from './GTMSetupGuide';
import { GTMTagSetup } from './GTMTagSetup';
import { SearchConsoleSetup } from './SearchConsoleSetup';

export const AnalyticsSetupGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>(['ga4']); // GA4 is already completed
  const [copiedText, setCopiedText] = useState<string>('');

  const markStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const setupSteps = [
    {
      id: 'ga4',
      title: 'Google Analytics 4 Setup',
      status: 'completed',
      steps: [
        '✅ GA4 Account created',
        '✅ Measurement ID obtained: G-E8XEF9FWZR',
        '✅ Updated in index.html',
        '✅ Analytics service configured',
        'Test the implementation using the Verification tab'
      ]
    },
    {
      id: 'gtm',
      title: 'Google Tag Manager Setup',
      status: completedSteps.includes('gtm') ? 'completed' : 'pending',
      steps: [
        '✅ GTM Container created: GTM-KNMLZ7MQ',
        '✅ Container ID updated in index.html',
        '✅ Basic GTM implementation active',
        'Configure advanced tags using GTM Tag Setup',
        'Test GTM implementation in Preview mode'
      ]
    },
    {
      id: 'gsc',
      title: 'Google Search Console Setup',
      status: completedSteps.includes('gsc') ? 'completed' : 'pending',
      steps: [
        'Go to https://search.google.com/search-console',
        'Click "Add Property"',
        'Choose "Domain" property type',
        'Enter domain: yeildsocials.com',
        'Verify ownership via DNS record or HTML file',
        'Submit XML sitemap (yeildsocials.com/sitemap.xml)',
        'Set up performance monitoring',
        'Configure crawl settings and indexing'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Analytics Setup Guide</h1>
        <p className="text-muted-foreground">
          Complete analytics setup with Google Analytics 4, Google Tag Manager, and Google Search Console
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <strong>✅ GA4 & GTM Setup Complete!</strong> Your analytics are now configured. Use the advanced guides below to optimize your setup.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gtm-setup">GTM Setup</TabsTrigger>
          <TabsTrigger value="gtm-tags">GTM Tags</TabsTrigger>
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Setup Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">GA4 Measurement ID</span>
                </div>
                <Badge className="bg-green-100 text-green-800">G-E8XEF9FWZR</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">GTM Container ID</span>
                </div>
                <Badge className="bg-green-100 text-green-800">GTM-KNMLZ7MQ</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Search Console</span>
                </div>
                <Badge variant="secondary">Setup Required</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Setup Steps */}
          {setupSteps.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {section.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                    )}
                    {section.title}
                  </CardTitle>
                  <Badge variant={section.status === 'completed' ? 'default' : 'secondary'}>
                    {section.status === 'completed' ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {section.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markStepComplete(section.id)}
                    disabled={section.status === 'completed'}
                  >
                    {section.status === 'completed' ? 'Completed' : 'Mark as Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(
                      section.id === 'ga4' ? 'https://analytics.google.com' :
                      section.id === 'gtm' ? 'https://tagmanager.google.com' :
                      'https://search.google.com/search-console',
                      '_blank'
                    )}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open {section.id === 'ga4' ? 'GA4' : section.id === 'gtm' ? 'GTM' : 'Search Console'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gtm-setup">
          <GTMSetupGuide />
        </TabsContent>

        <TabsContent value="gtm-tags">
          <GTMTagSetup />
        </TabsContent>

        <TabsContent value="search-console">
          <SearchConsoleSetup />
        </TabsContent>
      </Tabs>

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps & Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">After completing the setup:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use the Verification tab to test your analytics implementation</li>
              <li>• Configure advanced GTM tags for enhanced tracking</li>
              <li>• Set up Search Console for SEO monitoring</li>
              <li>• Monitor real-time data in Google Analytics</li>
              <li>• Test conversion tracking and custom events</li>
            </ul>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Use GTM Preview mode to test your tags before publishing, and check GA4 Real-Time reports to verify data flow.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
