
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, BarChart3, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickSetup: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link to="/analytics-setup">
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Setup Guide
          </Button>
        </Link>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://analytics.google.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            GA4
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://tagmanager.google.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            GTM
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.open('https://search.google.com/search-console', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Search Console
        </Button>
      </CardContent>
    </Card>
  );
};
