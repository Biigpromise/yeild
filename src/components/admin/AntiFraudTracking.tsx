
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Search, Ban, Users, Image } from 'lucide-react';
import { DuplicateReferralManager } from './DuplicateReferralManager';
import { DuplicateImageManager } from './DuplicateImageManager';
import { toast } from 'sonner';

export const AntiFraudTracking: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk Activities</p>
                <p className="text-xl font-bold text-red-600">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-xl font-bold text-yellow-600">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-xl font-bold text-green-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Anti-fraud system monitors IP addresses, device fingerprints, referral patterns, and image submissions to detect suspicious activity.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="duplicate-referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="duplicate-referrals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Duplicate Referrals
          </TabsTrigger>
          <TabsTrigger value="duplicate-images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Duplicate Images
          </TabsTrigger>
          <TabsTrigger value="location-abuse">Location Abuse</TabsTrigger>
          <TabsTrigger value="behavior-analysis">Behavior Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="duplicate-referrals">
          <DuplicateReferralManager />
        </TabsContent>

        <TabsContent value="duplicate-images">
          <DuplicateImageManager />
        </TabsContent>

        <TabsContent value="location-abuse">
          <Card>
            <CardHeader>
              <CardTitle>Location-Based Abuse Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This feature will detect abnormal signup patterns from the same location and will be implemented next.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Points vs. Behavior Ratio Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This feature will analyze user behavior patterns and will be implemented next.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
