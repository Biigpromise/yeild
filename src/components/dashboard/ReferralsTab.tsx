
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ReferralLinkShare } from '@/components/referral/ReferralLinkShare';
import { ReferralStatsDashboard } from '@/components/referral/ReferralStatsDashboard';
import { ReferralRewardsTier } from '@/components/referral/ReferralRewardsTier';
import { useReferralMonitoring } from '@/hooks/useReferralMonitoring';

interface ReferralData {
  referral_code: string;
  total_referrals_count: number;
  active_referrals_count: number;
  points: number;
}

interface Referral {
  id: string;
  referred_id: string;
  is_active: boolean;
  created_at: string;
  activated_at?: string;
  points_awarded?: number;
}

export const ReferralsTab: React.FC = () => {
  const { user } = useAuth();
  const { referralStats } = useReferralMonitoring();
  const [referralData, setReferralData] = useState<ReferralData>({
    referral_code: '',
    total_referrals_count: 0,
    active_referrals_count: 0,
    points: 0
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralData();
      loadReferrals();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, total_referrals_count, active_referrals_count, points')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading referral data:', error);
        return;
      }

      if (data) {
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading referrals:', error);
        return;
      }

      setReferrals(data || []);
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const getCurrentTier = (activeReferrals: number): 'bronze' | 'silver' | 'gold' => {
    if (activeReferrals >= 15) return 'gold';
    if (activeReferrals >= 5) return 'silver';
    return 'bronze';
  };

  const getNextTierProgress = (activeReferrals: number): number => {
    if (activeReferrals >= 15) return 100;
    if (activeReferrals >= 5) return ((activeReferrals - 5) / 10) * 100;
    return (activeReferrals / 5) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">Loading referral data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Share
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ReferralStatsDashboard
            totalReferrals={referralStats.totalReferrals}
            activeReferrals={referralStats.activeReferrals}
            pendingReferrals={referralStats.pendingReferrals}
            totalPointsEarned={referralData.points}
            currentTier={getCurrentTier(referralStats.activeReferrals)}
            nextTierProgress={getNextTierProgress(referralStats.activeReferrals)}
          />
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          <ReferralLinkShare referralCode={referralData.referral_code} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Referral History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No referrals yet</p>
                  <p className="text-sm">Share your referral code to start earning</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {referral.is_active ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">Referral #{referral.id.slice(0, 8)}</div>
                          <div className="text-sm text-muted-foreground">
                            Signed up {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                          </div>
                          {referral.activated_at && (
                            <div className="text-xs text-green-600">
                              Activated {formatDistanceToNow(new Date(referral.activated_at), { addSuffix: true })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.is_active ? "default" : "secondary"}>
                          {referral.is_active ? "Active" : "Pending"}
                        </Badge>
                        {referral.points_awarded && (
                          <div className="text-sm text-green-600 mt-1">
                            +{referral.points_awarded} pts
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <ReferralRewardsTier activeReferrals={referralStats.activeReferrals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
