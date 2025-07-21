
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Heart, Activity, Lock, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommunityChatTab } from './CommunityChatTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

export const CommunityTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();
  const { userStats } = useDashboard();
  
  // Check if user meets requirements (1 task and 3 referrals for community access)
  const hasAccess = userStats && userStats.tasks_completed >= 1 && userStats.active_referrals_count >= 3;

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Community - Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <p className="font-medium">Unlock the community by completing:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Complete 1 task ({userStats?.tasks_completed || 0}/1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Refer 3 friends ({userStats?.active_referrals_count || 0}/3)</span>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Community Locked
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="feed">
            <Heart className="h-4 w-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-6">
          <CommunityChatTab />
        </TabsContent>
        
        <TabsContent value="feed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Community Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6">
                <Heart className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold mb-2">Community Feed</h3>
                <p className="text-muted-foreground mb-4">See what the community is sharing</p>
                <Button variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6">
                <Activity className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
                <p className="text-muted-foreground mb-4">Track community activity and updates</p>
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
