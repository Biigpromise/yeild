
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export const GTMSetupGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const steps = [
    {
      title: "GTM Container Status",
      description: "Your GTM container is already set up and active",
      action: () => window.open('https://tagmanager.google.com', '_blank'),
      details: [
        "✅ Container ID: GTM-KNMLZ7MQ is active",
        "✅ Container code is properly installed",
        "✅ DataLayer is initialized and working",
        "Ready for advanced tag configuration"
      ]
    },
    {
      title: "Verify GTM Installation",
      description: "Check that GTM is properly loaded and functioning",
      details: [
        "Open GTM Preview mode in your container",
        "Navigate to your website",
        "Verify that GTM is firing correctly",
        "Check that dataLayer events are being captured"
      ]
    },
    {
      title: "Configure GA4 in GTM",
      description: "Set up Google Analytics 4 tracking through GTM for centralized management",
      details: [
        "In GTM, go to Tags > New",
        "Choose 'Google Analytics: GA4 Configuration'",
        "Enter your GA4 Measurement ID: G-E8XEF9FWZR",
        "Set trigger to 'All Pages'",
        "Save and test the tag",
        "Publish your container when ready"
      ]
    },
    {
      title: "Set Up Custom Events",
      description: "Configure tracking for specific user actions",
      details: [
        "Create GA4 Event tags for custom tracking",
        "Set up triggers for user interactions",
        "Configure parameters for enhanced tracking",
        "Test events using GTM Preview mode"
      ]
    },
    {
      title: "Enable Enhanced Ecommerce",
      description: "Track virtual currency and user earnings",
      details: [
        "Set up Enhanced Ecommerce tags",
        "Configure virtual currency tracking",
        "Track user earnings and withdrawals",
        "Set up conversion goals"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Tag Manager Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <strong>✅ GTM Container Active!</strong> Your GTM container <code>GTM-KNMLZ7MQ</code> is properly installed and working.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-green-500 text-white' : 
                      index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? <CheckCircle className="w-4 h-4" /> : 
                       index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <Badge variant={index === 0 ? "default" : index <= currentStep ? "default" : "secondary"}>
                    {index === 0 ? "Active" : index < currentStep ? "Complete" : index === currentStep ? "Current" : "Pending"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                
                {step.details && (
                  <ul className="text-sm space-y-1 mb-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  {step.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={step.action}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open GTM
                    </Button>
                  )}
                  
                  {index > 0 && index < steps.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(Math.max(currentStep, index + 1))}
                      disabled={index >= currentStep}
                    >
                      {index < currentStep ? "Completed" : "Mark Complete"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-medium">GTM Container ID</p>
                <code className="text-sm text-muted-foreground">GTM-KNMLZ7MQ</code>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-medium">GA4 Measurement ID</p>
                <code className="text-sm text-muted-foreground">G-E8XEF9FWZR</code>
              </div>
              <Badge className="bg-green-100 text-green-800">Configured</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your GTM container is active and ready for advanced configuration:
            </p>
            <ol className="text-sm space-y-1">
              <li>1. Use the "GTM Tags" tab to configure advanced tracking</li>
              <li>2. Set up custom events for user interactions</li>
              <li>3. Configure Enhanced Ecommerce for earnings tracking</li>
              <li>4. Test your setup using GTM Preview mode</li>
              <li>5. Use the Analytics Verification tab to verify data flow</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
