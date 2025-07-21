
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, TrendingUp, Clock, Target, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useReferralMonitoring } from '@/hooks/useReferralMonitoring';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

const ReferralStatsCard: React.FC<{
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}> = ({ totalReferrals, activeReferrals, pendingReferrals, totalPointsEarned }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{totalReferrals}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-xl font-bold">{activeReferrals}</p>
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
            <p className="text-xl font-bold">{pendingReferrals}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yeild-yellow/20 rounded-lg">
            <Target className="h-5 w-5 text-yeild-yellow" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="text-xl font-bold text-yeild-yellow">{totalPointsEarned}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ReferralLinkShare: React.FC<{ referralCode: string }> = ({ referralCode }) => {
  const referralLink = referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : '';

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Share Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-muted"
          />
          <Button onClick={copyToClipboard} variant="outline">
            Copy
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Share this link to earn rewards when your friends join YIELD!
        </p>
      </CardContent>
    </Card>
  );
};

const ReferralTabContent: React.FC = () => {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReferralData();
      loadReferrals();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code, total_referrals_count, active_referrals_count, points')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading referral data:', error);
        setError('Failed to load referral data');
        return;
      }

      if (data) {
        setReferralData({
          referral_code: data.referral_code || '',
          total_referrals_count: data.total_referrals_count || 0,
          active_referrals_count: data.active_referrals_count || 0,
          points: data.points || 0
        });
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      setError('Failed to load referral data');
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadReferralData();
    loadReferrals();
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

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReferralStatsCard
        totalReferrals={referralStats.totalReferrals}
        activeReferrals={referralStats.activeReferrals}
        pendingReferrals={referralStats.pendingReferrals}
        totalPointsEarned={referralData.points}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Referral Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yeild-yellow/10 rounded-lg border border-yeild-yellow/20">
                  <h4 className="font-semibold text-yeild-yellow mb-2">How Referrals Work</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share your referral link with friends</li>
                    <li>• They sign up using your link</li>
                    <li>• You earn points when they complete tasks</li>
                    <li>• More active referrals = higher rewards</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-1">Activation Rate</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {referralStats.totalReferrals > 0 
                        ? Math.round((referralStats.activeReferrals / referralStats.totalReferrals) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-1">Avg. Points/Referral</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {referralStats.activeReferrals > 0 
                        ? Math.round(referralData.points / referralStats.activeReferrals)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <ReferralLinkShare referralCode={referralData.referral_code} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">Share your referral link to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Referral #{referral.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                        </p>
                        {referral.activated_at && (
                          <p className="text-xs text-green-600">
                            Activated {formatDistanceToNow(new Date(referral.activated_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={referral.is_active ? "default" : "secondary"}>
                          {referral.is_active ? "Active" : "Pending"}
                        </Badge>
                        {referral.points_awarded && (
                          <Badge variant="outline" className="text-yeild-yellow">
                            +{referral.points_awarded} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const ReferralsTab: React.FC = () => {
  return (
    <ErrorBoundary>
      <ReferralTabContent />
    </ErrorBoundary>
  );
};
