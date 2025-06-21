
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminBirdLevelOverrides } from '@/components/admin/AdminBirdLevelOverrides';
import { PhoenixBirdDisplay } from '@/components/referral/PhoenixBirdDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bird, Users, Trophy, Crown } from 'lucide-react';
import { BirdBadge } from '@/components/referral/BirdBadge';
import { BIRD_LEVELS } from '@/services/userService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BirdLevelManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BirdLevelManagementDialog: React.FC<BirdLevelManagementDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [stats, setStats] = useState({
    phoenixBirds: 0,
    falconBirds: 0,
    eagleBirds: 0,
    activeReferrals: 0
  });

  const handleBirdLevelOverride = (userId: string, newLevel: string) => {
    console.log(`Bird level override applied: User ${userId} promoted to ${newLevel}`);
    
    if (newLevel === 'Phoenix') {
      setStats(prev => ({ ...prev, phoenixBirds: prev.phoenixBirds + 1 }));
    } else if (newLevel === 'Falcon') {
      setStats(prev => ({ ...prev, falconBirds: prev.falconBirds + 1 }));
    } else if (newLevel === 'Eagle') {
      setStats(prev => ({ ...prev, eagleBirds: prev.eagleBirds + 1 }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bird className="h-6 w-6 text-blue-600" />
            Bird Level Management System
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phoenix">Phoenix Preview</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Current Bird Level Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border">
                    <div className="text-3xl font-bold text-red-600 mb-2">{stats.phoenixBirds}</div>
                    <div className="text-sm font-medium text-red-700 mb-2">Phoenix Birds</div>
                    <Badge variant="outline" className="text-xs">Legendary</Badge>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{stats.falconBirds}</div>
                    <div className="text-sm font-medium text-purple-700 mb-2">Falcon Birds</div>
                    <Badge variant="outline" className="text-xs">Elite</Badge>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border">
                    <div className="text-3xl font-bold text-amber-600 mb-2">{stats.eagleBirds}</div>
                    <div className="text-sm font-medium text-amber-700 mb-2">Eagle Birds</div>
                    <Badge variant="outline" className="text-xs">Advanced</Badge>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeReferrals}</div>
                    <div className="text-sm font-medium text-green-700 mb-2">Active Referrals</div>
                    <Badge variant="outline" className="text-xs">Total</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bird Level Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Bird Level Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {BIRD_LEVELS.map((level) => (
                    <div key={level.name} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <BirdBadge birdLevel={level} size="lg" showName />
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{level.minReferrals}+ referrals</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{level.minPoints}+ points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phoenix">
            <PhoenixBirdDisplay />
          </TabsContent>

          <TabsContent value="management">
            <AdminBirdLevelOverrides onOverride={handleBirdLevelOverride} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
