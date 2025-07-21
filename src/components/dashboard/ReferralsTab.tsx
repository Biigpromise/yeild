import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Share, Copy, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ReferralLinkShare } from '@/components/referral/ReferralLinkShare';

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

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referral_code);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferralLink = () => {
    const referralLink = `https://yeildsocials.com/signup?ref=${referralData.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
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
      {/* Referral Link Share Component */}
      <ReferralLinkShare 
        referralCode={referralData.referral_code} 
        customDomain="yeildsocials.com" 
      />

      {/* Referral Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
            <div className="text-3xl font-bold text-yeild-yellow mb-2">
              {referralData.active_referrals_count}
            </div>
            <p className="text-muted-foreground">Active Referrals</p>
            <div className="text-sm text-muted-foreground mt-1">
              {referralData.total_referrals_count} total referrals
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-center">
                {referralData.referral_code}
              </div>
              <Button onClick={copyReferralCode} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={shareReferralLink}>
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline">
              <Gift className="h-4 w-4 mr-2" />
              Rewards
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{referralData.total_referrals_count}</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{referralData.active_referrals_count}</div>
            <div className="text-sm text-muted-foreground">Active Referrals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{referralData.points}</div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
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
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Referral #{referral.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        Signed up {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                      </div>
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
    </div>
  );
};
