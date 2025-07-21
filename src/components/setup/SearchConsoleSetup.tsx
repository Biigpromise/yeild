
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ExternalLink, Copy, Globe, Search } from 'lucide-react';

export const SearchConsoleSetup: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const markComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const verificationMethods = [
    {
      method: "HTML File Upload",
      description: "Upload a verification file to your website root",
      steps: [
        "Download the HTML verification file from Search Console",
        "Upload it to your website's root directory",
        "Ensure it's accessible at: https://yeildsocials.com/[filename].html",
        "Click 'Verify' in Search Console"
      ]
    },
    {
      method: "HTML Tag",
      description: "Add a meta tag to your website's head section",
      steps: [
        "Copy the meta tag from Search Console",
        "Add it to the <head> section of your index.html",
        "Deploy your changes",
        "Click 'Verify' in Search Console"
      ]
    },
    {
      method: "DNS Record",
      description: "Add a TXT record to your domain's DNS settings",
      steps: [
        "Copy the TXT record from Search Console",
        "Add it to your domain's DNS settings",
        "Wait for DNS propagation (up to 24 hours)",
        "Click 'Verify' in Search Console"
      ]
    }
  ];

  const setupSteps = [
    {
      id: "property",
      title: "Add Property",
      description: "Add your domain to Search Console",
      details: [
        "Go to Google Search Console",
        "Click 'Add Property'",
        "Choose 'Domain' property type",
        "Enter: yeildsocials.com",
        "Choose verification method"
      ]
    },
    {
      id: "verify",
      title: "Verify Ownership",
      description: "Prove you own the domain",
      details: [
        "Choose your preferred verification method",
        "Follow the verification steps",
        "Wait for verification confirmation",
        "Access your property dashboard"
      ]
    },
    {
      id: "sitemap",
      title: "Submit Sitemap",
      description: "Help Google discover your pages",
      details: [
        "Generate XML sitemap for your site",
        "Upload sitemap to: https://yeildsocials.com/sitemap.xml",
        "In Search Console, go to Sitemaps",
        "Submit: https://yeildsocials.com/sitemap.xml"
      ]
    },
    {
      id: "settings",
      title: "Configure Settings",
      description: "Set up crawling and indexing preferences",
      details: [
        "Set preferred domain version (www vs non-www)",
        "Configure crawl rate settings",
        "Set up URL parameters handling",
        "Configure international targeting if needed"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Google Search Console Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Search Console helps you monitor your site's presence in Google Search results and provides valuable SEO insights.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup Steps</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-4">
              {setupSteps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.includes(step.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {completedSteps.includes(step.id) ? <CheckCircle className="w-4 h-4" /> : index + 1}
                      </div>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <Badge variant={completedSteps.includes(step.id) ? "default" : "secondary"}>
                      {completedSteps.includes(step.id) ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  
                  <ol className="text-sm space-y-1 mb-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ol>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markComplete(step.id)}
                    disabled={completedSteps.includes(step.id)}
                  >
                    {completedSteps.includes(step.id) ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              <div className="space-y-4">
                {verificationMethods.map((method, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{method.method}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                      <ol className="text-sm space-y-2">
                        {method.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                              {stepIndex + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SEO Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <h4 className="font-medium mb-2">Page Performance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Monitor Core Web Vitals</li>
                        <li>• Fix crawl errors</li>
                        <li>• Optimize page load speed</li>
                        <li>• Ensure mobile-friendliness</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <h4 className="font-medium mb-2">Content Strategy</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Submit updated sitemaps</li>
                        <li>• Monitor search queries</li>
                        <li>• Track click-through rates</li>
                        <li>• Optimize meta descriptions</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium mb-2">GA4 Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Link Search Console with Google Analytics 4 to get comprehensive insights about your organic traffic and user behavior.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Search Console
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://analytics.google.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Link with GA4
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
