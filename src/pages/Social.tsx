
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CommunityChatTab } from '@/components/dashboard/CommunityChatTab';
import { SocialHub } from '@/components/social/SocialHub';
import { StoriesBar } from '@/components/social/StoriesBar';
import { Leaderboard } from '@/components/Leaderboard';
import { WeeklyChampions } from '@/components/social/WeeklyChampions';
import { UserProfileBirds } from '@/components/community/UserProfileBirds';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageCircle, 
  Trophy, 
  Star, 
  TrendingUp,
  Activity,
  Crown,
  Heart,
  Share2
} from 'lucide-react';

const Social: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('community');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Social Hub
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with the community, share your achievements, and climb the leaderboards together
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Live Activity
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Top Performers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6" id="social-content">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Community</p>
                  <p className="text-2xl font-bold">2.5K+</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold">12.8K</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-bold">856</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interactions</p>
                  <p className="text-2xl font-bold">45.2K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Stories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SocialHub />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Your Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user && (
                      <UserProfileBirds 
                        points={0} 
                        tasksCompleted={0} 
                        level={1} 
                        activeReferrals={0}
                      />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Leaderboard coming soon...</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <div className="h-[calc(100vh-200px)] min-h-[600px]">
              <CommunityChatTab />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Leaderboard />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Champions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyChampions />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Community Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StoriesBar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Social;
