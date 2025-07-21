
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
      title: "Create GTM Account",
      description: "Go to Google Tag Manager and create a new account",
      action: () => window.open('https://tagmanager.google.com', '_blank')
    },
    {
      title: "Set Up Container",
      description: "Create a new container for your website",
      details: [
        "Click 'Create Account' if you don't have one",
        "Account name: 'YEILD Social Platform'",
        "Container name: 'yeildsocials.com'",
        "Choose 'Web' as the target platform",
        "Click 'Create'"
      ]
    },
    {
      title: "Get Container ID",
      description: "Copy your GTM Container ID from the installation instructions",
      details: [
        "After creating the container, you'll see installation instructions",
        "Look for the Container ID in format: GTM-XXXXXXX",
        "Copy this ID - you'll need it for the next step"
      ]
    },
    {
      title: "Update Your Website",
      description: "Replace the placeholder GTM ID in your website code",
      details: [
        "Find GTM-XXXXXXXXX in your index.html file",
        "Replace it with your actual GTM Container ID",
        "Make sure to replace it in both places (head and body sections)"
      ]
    },
    {
      title: "Configure GA4 in GTM (Optional)",
      description: "Set up Google Analytics 4 tracking through GTM",
      details: [
        "In GTM, go to Tags > New",
        "Choose 'Google Analytics: GA4 Configuration'",
        "Enter your GA4 Measurement ID: G-E8XEF9FWZR",
        "Set trigger to 'All Pages'",
        "Save and publish your container"
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Status:</strong> Your GA4 ID has been updated to <code>G-E8XEF9FWZR</code>. 
              Now you need to get your GTM Container ID and update the placeholder.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <Badge variant={index <= currentStep ? "default" : "secondary"}>
                    {index < currentStep ? "Complete" : index === currentStep ? "Current" : "Pending"}
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
                  
                  {index < steps.length - 1 && (
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
          <CardTitle>Current Placeholder to Replace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-muted rounded">
            <div>
              <p className="font-medium">GTM Container ID Placeholder</p>
              <code className="text-sm text-muted-foreground">GTM-XXXXXXXXX</code>
              <p className="text-xs text-muted-foreground mt-1">
                Replace this with your actual GTM Container ID in index.html
              </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              After you get your GTM Container ID from Google Tag Manager:
            </p>
            <ol className="text-sm space-y-1">
              <li>1. Replace both instances of <code>GTM-XXXXXXXXX</code> in index.html</li>
              <li>2. Use the Analytics Verification tab to test your setup</li>
              <li>3. Check GTM Preview mode to ensure tags are firing</li>
              <li>4. Monitor real-time data in Google Analytics</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
