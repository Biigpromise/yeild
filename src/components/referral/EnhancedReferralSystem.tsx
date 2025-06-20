
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Users, 
  Copy, 
  Share2, 
  Target,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";
import { userService, UserReferral, ReferralStats, BIRD_LEVELS } from "@/services/userService";
import { BirdBadge } from "./BirdBadge";

export const EnhancedReferralSystem = () => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [userReferrals, setUserReferrals] = useState<UserReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      const [code, stats, referrals] = await Promise.all([
        userService.getUserReferralCode(),
        userService.getReferralStats(),
        userService.getUserReferrals()
      ]);

      setReferralCode(code || "");
      setReferralStats(stats);
      setUserReferrals(referrals);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join YIELD and help me earn my next bird badge!",
        text: "Sign up for YIELD using my referral link and help me climb the referral leaderboard!",
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading referral data...</div>;
  }

  if (!referralStats) {
    return <div className="text-center p-8">Unable to load referral data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bird Level Progress Banner */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <BirdBadge birdLevel={referralStats.bird_level} size="lg" showName />
              <div>
                <h3 className="text-xl font-bold">{referralStats.bird_level.name} Status</h3>
                <p className="text-sm text-muted-foreground">{referralStats.bird_level.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{referralStats.active_referrals}</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
            </div>
          </div>
          
          {referralStats.next_bird_level && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {referralStats.next_bird_level.name}</span>
                <span>{referralStats.referrals_to_next} more referrals needed</span>
              </div>
              <Progress 
                value={(referralStats.active_referrals / referralStats.next_bird_level.minReferrals) * 100} 
                className="h-3"
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Next level: {referralStats.next_bird_level.name} Bird Badge
                </div>
                <BirdBadge birdLevel={referralStats.next_bird_level} size="sm" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bird Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bird Badge Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {BIRD_LEVELS.map((level, index) => (
              <div 
                key={level.name}
                className={`p-4 rounded-lg border-2 text-center ${
                  referralStats.active_referrals >= level.minReferrals 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-center mb-2">
                  <BirdBadge birdLevel={level} size="md" />
                </div>
                <h4 className="font-semibold text-sm">{level.name}</h4>
                <p className="text-xs text-muted-foreground">{level.minReferrals}+ referrals</p>
                {referralStats.active_referrals >= level.minReferrals && (
                  <Badge variant="default" className="mt-2 text-xs">Unlocked</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-xl font-bold">{referralStats.total_referrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Referrals</p>
                <p className="text-xl font-bold">{referralStats.active_referrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{referralStats.pending_referrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Bird Badges Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">1. Share Your Link</h4>
              <p className="text-sm text-blue-700">
                Share your unique referral link with friends and family.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">2. They Get Active</h4>
              <p className="text-sm text-orange-700">
                Your referrals must complete 1 task OR earn 50 points to become "active".
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">3. Earn Bird Badges</h4>
              <p className="text-sm text-green-700">
                Collect prestigious bird badges based on your active referral count!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="share">Share Link</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareReferralLink}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link and build your way to the <strong>Phoenix badge</strong> with 1000+ active referrals!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={referral.referred_user?.profile_picture_url} />
                        <AvatarFallback>
                          {referral.referred_user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{referral.referred_user?.name || 'Anonymous User'}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.is_active ? "default" : "secondary"}>
                        {referral.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {referral.is_active ? 'Counts toward badge' : 'Needs 1 task or 50 points'}
                      </p>
                    </div>
                  </div>
                ))}
                {userReferrals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet. Start sharing your link to earn bird badges!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
