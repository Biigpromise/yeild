
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, ExternalLink, Copy, AlertCircle } from 'lucide-react';

export const AnalyticsSetupGuide: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
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
      status: completedSteps.includes('ga4') ? 'completed' : 'pending',
      steps: [
        'Go to https://analytics.google.com',
        'Click "Start measuring" or "Create Account"',
        'Enter account name: "YEILD Social Platform"',
        'Create a new property for "yeildsocials.com"',
        'Choose "Web" as the platform',
        'Enter website URL: https://yeildsocials.com',
        'Copy your Measurement ID (format: G-XXXXXXXXXX)',
        'Replace G-XXXXXXXXXX in index.html with your actual ID'
      ]
    },
    {
      id: 'gtm',
      title: 'Google Tag Manager Setup',
      status: completedSteps.includes('gtm') ? 'completed' : 'pending',
      steps: [
        'Go to https://tagmanager.google.com',
        'Click "Create Account"',
        'Account name: "YEILD Social Platform"',
        'Container name: "yeildsocials.com"',
        'Choose "Web" as the target platform',
        'Copy your Container ID (format: GTM-XXXXXXX)',
        'Replace GTM-XXXXXXXXX in index.html with your actual ID',
        'Configure GA4 tag in GTM (recommended for advanced tracking)'
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
          Follow these steps to set up Google Analytics 4, Google Tag Manager, and Google Search Console
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> You need to update the placeholder IDs in index.html with your actual tracking IDs from Google services.
        </AlertDescription>
      </Alert>

      {/* Current Placeholder IDs */}
      <Card>
        <CardHeader>
          <CardTitle>Current Placeholder IDs to Replace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded">
            <div>
              <p className="font-medium">GA4 Measurement ID</p>
              <code className="text-sm text-muted-foreground">G-XXXXXXXXXX</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('G-XXXXXXXXXX', 'ga4')}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copiedText === 'ga4' ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded">
            <div>
              <p className="font-medium">GTM Container ID</p>
              <code className="text-sm text-muted-foreground">GTM-XXXXXXXXX</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard('GTM-XXXXXXXXX', 'gtm')}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copiedText === 'gtm' ? 'Copied!' : 'Copy'}
            </Button>
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

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Verification & Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">After updating the IDs:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use Google Analytics Real-Time reports to verify tracking</li>
              <li>• Test GTM Preview mode to confirm tag firing</li>
              <li>• Check Search Console for crawl errors</li>
              <li>• Use the analytics dashboard to monitor events</li>
            </ul>
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> After setup, it can take 24-48 hours for data to fully populate in Google Analytics and Search Console.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
