
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ExternalLink, Copy, Info } from 'lucide-react';

export const GTMTagSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const ga4ConfigSteps = [
    {
      title: "Create GA4 Configuration Tag",
      description: "Set up Google Analytics 4 tracking through GTM",
      steps: [
        "In GTM, navigate to Tags > New",
        "Click 'Tag Configuration' and select 'Google Analytics: GA4 Configuration'",
        "Enter Measurement ID: G-E8XEF9FWZR",
        "Set Trigger to 'All Pages'",
        "Name the tag 'GA4 Configuration'",
        "Save the tag"
      ]
    },
    {
      title: "Create Custom Event Tags",
      description: "Track specific user actions and conversions",
      steps: [
        "Create new tag: 'Google Analytics: GA4 Event'",
        "Event Name: {{Event Name}} (use built-in variable)",
        "Add custom parameters for user actions",
        "Set trigger to 'Custom Event'",
        "Configure for: login, signup, task_completion, social_interaction"
      ]
    },
    {
      title: "Enhanced Ecommerce Setup",
      description: "Track earnings, withdrawals, and virtual currency",
      steps: [
        "Create GA4 Event tag for 'earn_virtual_currency'",
        "Add parameters: virtual_currency_name, value, source",
        "Create tag for 'withdrawal_request' events",
        "Set up conversion tracking for key actions",
        "Configure audience triggers for brand campaigns"
      ]
    }
  ];

  const conversionGoals = [
    {
      name: "User Registration",
      event: "sign_up",
      description: "Track new user registrations"
    },
    {
      name: "Task Completion",
      event: "task_completion",
      description: "Track completed tasks and rewards"
    },
    {
      name: "Social Engagement",
      event: "social_interaction",
      description: "Track likes, comments, and shares"
    },
    {
      name: "Earnings",
      event: "earn_virtual_currency",
      description: "Track points and rewards earned"
    },
    {
      name: "Withdrawals",
      event: "withdrawal_request",
      description: "Track withdrawal requests and completions"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GTM Tag Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure these tags in your GTM container (GTM-KNMLZ7MQ) for centralized analytics management.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="ga4-config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ga4-config">GA4 Setup</TabsTrigger>
              <TabsTrigger value="custom-events">Custom Events</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
            </TabsList>

            <TabsContent value="ga4-config" className="space-y-4">
              {ga4ConfigSteps.map((section, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{section.title}</h3>
                    <Badge variant="outline">Step {index + 1}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                  <ol className="text-sm space-y-2">
                    {section.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                          {stepIndex + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="custom-events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Event Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-medium">Authentication Events</h4>
                        <ul className="text-sm text-muted-foreground mt-1">
                          <li>• sign_up</li>
                          <li>• login</li>
                          <li>• logout</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-medium">Engagement Events</h4>
                        <ul className="text-sm text-muted-foreground mt-1">
                          <li>• task_completion</li>
                          <li>• social_interaction</li>
                          <li>• page_view</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-medium">Monetization Events</h4>
                        <ul className="text-sm text-muted-foreground mt-1">
                          <li>• earn_virtual_currency</li>
                          <li>• withdrawal_request</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <h4 className="font-medium">Brand Events</h4>
                        <ul className="text-sm text-muted-foreground mt-1">
                          <li>• campaign_creation</li>
                          <li>• campaign_view</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversion Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conversionGoals.map((goal, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{goal.event}</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(goal.event, goal.event)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://tagmanager.google.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open GTM
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://analytics.google.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open GA4
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
