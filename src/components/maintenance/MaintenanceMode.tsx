import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Clock, Mail } from 'lucide-react';

const MaintenanceMode = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center">
            <Construction className="w-10 h-10 text-warning" />
          </div>
          <div>
            <CardTitle className="text-2xl text-foreground mb-2">
              Maintenance Mode
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              YEILD is currently undergoing scheduled maintenance to improve your experience.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-warning">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">We'll be back soon!</span>
            </div>
            
            <p className="text-muted-foreground text-sm">
              Our team is working hard to bring you new features and improvements. 
              Please check back in a few minutes.
            </p>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="text-xs">
                  Need help? Contact us at support@yeildsocials.com
                </span>
              </div>
            </div>
          </div>
          
          <div className="animate-pulse">
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceMode;