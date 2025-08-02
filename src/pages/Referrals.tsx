
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedReferralSystem } from '@/components/referral/EnhancedReferralSystem';
import { UserProfileBirds } from '@/components/community/UserProfileBirds';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Share2, 
  Trophy, 
  TrendingUp,
  Gift,
  Crown,
  Target,
  Sparkles,
  Copy,
  MessageSquare
} from 'lucide-react';

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Referral Program
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect brands with talented users through YIELD. Earn points and unlock exclusive opportunities by growing our community!
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Gift className="h-3 w-3" />
                Earn Rewards
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Level Up
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Grow Together
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Note: Stats are now real data from the EnhancedReferralSystem component */}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Referrals
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share & Invite
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Share2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                        <p className="text-sm text-muted-foreground">
                          Share YIELD with your network and help connect brands with talented users
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-6 w-6 text-green-500" />
                        </div>
                        <h3 className="font-semibold mb-2">2. Users Join YIELD</h3>
                        <p className="text-sm text-muted-foreground">
                          New users complete tasks and connect with brands through your referral
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trophy className="h-6 w-6 text-purple-500" />
                        </div>
                        <h3 className="font-semibold mb-2">3. Unlock Bird Levels</h3>
                        <p className="text-sm text-muted-foreground">
                          Progress through bird levels and earn commission from your referrals' YIELD earnings
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Bird Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserProfileBirds 
                      points={0} 
                      tasksCompleted={0} 
                      level={1} 
                      activeReferrals={0}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => setActiveTab('share')}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Link
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Invite via Message
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <div className="space-y-4">
              <EnhancedReferralSystem />
            </div>
          </TabsContent>

          <TabsContent value="share">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Your Referral Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your Referral Link:</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value="https://app.example.com/ref/abc123"
                        className="flex-1 p-2 border rounded text-sm"
                        readOnly
                      />
                      <Button size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="p-6 h-auto flex flex-col items-center gap-2">
                      <MessageSquare className="h-6 w-6" />
                      Share via Messages
                    </Button>
                    <Button variant="outline" className="p-6 h-auto flex flex-col items-center gap-2">
                      <Share2 className="h-6 w-6" />
                      Social Media
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Referral Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">YIELD Referral Benefits</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Commission from referral task completions</li>
                        <li>• Progress toward higher bird levels</li>
                        <li>• Access to exclusive brand campaigns</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Advanced YIELD Perks</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Priority access to high-paying campaigns</li>
                        <li>• Direct brand partnership opportunities</li>
                        <li>• Enhanced earning rates per task</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Referrals;
