
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
  Gift,
  TrendingUp,
  Award,
  Star,
  Clock,
  CheckCircle,
  Target
} from "lucide-react";
import { userService, UserReferral, ReferralStats } from "@/services/userService";

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
        title: "Join YIELD and earn rewards!",
        text: "Sign up for YIELD using my referral link and we both get bonus points!",
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  const getTierInfo = (activeReferrals: number) => {
    if (activeReferrals >= 15) {
      return { name: 'Platinum', color: 'bg-purple-100 text-purple-800', points: 30 };
    } else if (activeReferrals >= 5) {
      return { name: 'Silver', color: 'bg-gray-100 text-gray-800', points: 20 };
    } else {
      return { name: 'Bronze', color: 'bg-amber-100 text-amber-800', points: 10 };
    }
  };

  const getNextTierInfo = (activeReferrals: number) => {
    if (activeReferrals < 5) {
      return { name: 'Silver', needed: 5 - activeReferrals, points: 20 };
    } else if (activeReferrals < 15) {
      return { name: 'Platinum', needed: 15 - activeReferrals, points: 30 };
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading referral data...</div>;
  }

  if (!referralStats) {
    return <div className="text-center p-8">Unable to load referral data</div>;
  }

  const currentTier = getTierInfo(referralStats.active_referrals);
  const nextTier = getNextTierInfo(referralStats.active_referrals);

  return (
    <div className="space-y-6">
      {/* Tier Progress Banner */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge className={currentTier.color}>
                <Award className="h-4 w-4 mr-1" />
                {currentTier.name} Tier
              </Badge>
              <span className="text-lg font-semibold">{currentTier.points} points per active referral</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{referralStats.active_referrals}</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
            </div>
          </div>
          
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name} Tier</span>
                <span>{nextTier.needed} more active referrals needed</span>
              </div>
              <Progress 
                value={(referralStats.active_referrals / (referralStats.active_referrals + nextTier.needed)) * 100} 
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                Next tier rewards: {nextTier.points} points per referral
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="text-xl font-bold">{referralStats.total_points_earned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral System Info */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
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
              <h4 className="font-semibold text-green-900 mb-2">3. You Earn Points</h4>
              <p className="text-sm text-green-700">
                Get tiered rewards: 10pts (1-5), 20pts (6-15), 30pts (15+) per active referral.
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
                Share this link and earn <strong>{currentTier.points} points</strong> for each friend who becomes active!
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
                      <div className="flex items-center gap-2">
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
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {referral.points_awarded > 0 ? `${referral.points_awarded} pts earned` : 'No points yet'}
                      </p>
                    </div>
                  </div>
                ))}
                {userReferrals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet. Start sharing your link!</p>
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
