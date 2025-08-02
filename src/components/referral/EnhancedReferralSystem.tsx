import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { userService, UserReferral, ReferralStats } from "@/services/userService";
import { BirdProgression } from "./BirdProgression";
import { BirdLevelNotification } from "./BirdLevelNotification";
import { ProfileBirdBadge } from "./ProfileBirdBadge";
import { CommissionDashboard } from "./CommissionDashboard";
import { ReferralTroubleshooter } from "./ReferralTroubleshooter";

import { supabase } from "@/integrations/supabase/client";
import { generateReferralLink, APP_CONFIG } from "@/config/app";

export const EnhancedReferralSystem = () => {
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [previousStats, setPreviousStats] = useState<ReferralStats | null>(null);
  const [userReferrals, setUserReferrals] = useState<UserReferral[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Get user points
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();
        
        setUserPoints(profile?.points || 0);
      }

      const [code, stats, referrals] = await Promise.all([
        userService.getUserReferralCode(),
        userService.getReferralStats(),
        userService.getUserReferrals()
      ]);

      // Store previous stats for comparison
      if (referralStats) {
        setPreviousStats(referralStats);
      }

      setReferralCode(code || "");
      setReferralStats(stats);
      setUserReferrals(referrals);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralCode ? generateReferralLink(referralCode) : '';

  const copyReferralLink = () => {
    if (!referralLink) {
      toast.error("Referral code not available");
      return;
    }
    navigator.clipboard.writeText(referralLink);
    toast.success("Professional referral link copied!");
  };

  const shareReferralLink = () => {
    if (!referralLink) {
      toast.error("Referral code not available");
      return;
    }
    
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
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading referral data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!referralStats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Referral System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Get started with referrals!</p>
              <Button onClick={loadReferralData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bird Level Notification Component */}
      <BirdLevelNotification 
        previousLevel={previousStats?.bird_level || null}
        currentLevel={referralStats.bird_level}
        activeReferrals={referralStats.activeReferrals}
      />

      {/* Bird Progression Component */}
      <BirdProgression
        userPoints={userPoints}
        activeReferrals={referralStats.activeReferrals}
        currentBirdLevel={referralStats.bird_level}
        nextBirdLevel={referralStats.next_bird_level}
      />

      {/* Commission Dashboard */}
      <CommissionDashboard />

      {/* Troubleshooter for referral issues */}
      <ReferralTroubleshooter />


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
                <p className="text-xl font-bold">{referralStats.totalReferrals}</p>
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
                <p className="text-xl font-bold">{referralStats.activeReferrals}</p>
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
                <p className="text-sm text-muted-foreground">Current Points</p>
                <p className="text-xl font-bold">{userPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Professional Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
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
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-800">
                  <p><strong>✓ Professional Domain:</strong> {APP_CONFIG.getAppDomain()}</p>
                  <p className="text-xs mt-1">Your referral links now use your professional domain for better trust and click-through rates!</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Help expand the YIELD community and earn commission from your referrals' task earnings. Progress to <strong>Phoenix level</strong> for maximum rewards!
              </p>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Your referral code is being generated...</p>
              <p className="text-xs mt-2">Please try refreshing the page if this persists.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={referral.referred_user?.profile_picture_url} />
                      <AvatarFallback>
                        {referral.referred_user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {referral.referred_user?.id && (
                      <div className="absolute -top-1 -right-1">
                        <ProfileBirdBadge userId={referral.referred_user.id} size="sm" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{referral.referred_user?.name || 'Anonymous User'}</p>
                      {referral.referred_user?.id && (
                        <ProfileBirdBadge userId={referral.referred_user.id} size="sm" />
                      )}
                    </div>
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
                    {referral.is_active ? 'Counts toward badge' : 'Need to complete tasks'}
                  </p>
                </div>
              </div>
            ))}
            {userReferrals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Share your YIELD link to start earning commission and unlock bird levels!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
