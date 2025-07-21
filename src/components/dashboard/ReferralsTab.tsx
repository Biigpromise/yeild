
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Share, Copy } from 'lucide-react';

export const ReferralsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-6">
            <div className="text-3xl font-bold text-yeild-yellow mb-2">0 Referrals</div>
            <p className="text-muted-foreground mb-4">Invite friends and earn together</p>
            
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="text-sm font-mono">Your referral code will appear here</p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
