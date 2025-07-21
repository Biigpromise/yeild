
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralMonitoring } from '@/hooks/useReferralMonitoring';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingFallback } from '@/components/ui/loading-fallback';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

export const EnhancedReferralsTab: React.FC = () => {
  const { user } = useAuth();
  const { errorState, handleError, retry, clearError } = useErrorRecovery();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use the fixed referral monitoring hook
  const { isConnected, connectionError } = useReferralMonitoring();

  const loadReferralStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const stats = await referralService.getReferralStats(user.id);
      if (stats) {
        setReferralStats(stats);
      }
    } catch (error) {
      handleError(error as Error, 'loading referral stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferralStats();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadReferralStats();
      toast.success('Referral data refreshed');
    } catch (error) {
      handleError(error as Error, 'refreshing referral data');
    } finally {
      setRefreshing(false);
    }
  };

  const copyReferralLink = async () => {
    if (!user?.id) return;
    
    try {
      const referralLink = `${window.location.origin}/signup?ref=${user.id}`;
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy referral link');
    }
  };

  if (loading) {
    return <LoadingFallback type="referral" message="Loading referral data..." />;
  }

  if (errorState.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-destructive mb-4">
              Failed to load referral data
            </div>
            <Button 
              onClick={() => retry(loadReferralStats)}
              disabled={errorState.isRecovering}
            >
              {errorState.isRecovering ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Connection Status */}
        {connectionError && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">
                  Real-time updates temporarily unavailable. Data may not be current.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                  <p className="text-2xl font-bold">{referralStats.activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Earnings</p>
                  <p className="text-2xl font-bold">{referralStats.activeReferrals * 10} pts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Referral Link</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <code className="text-sm break-all">
                  {window.location.origin}/signup?ref={user?.id}
                </code>
              </div>
              <Button onClick={copyReferralLink} className="w-full">
                Copy Referral Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{isConnected ? 'Real-time updates active' : 'Limited connectivity'}</span>
          </div>
          {errorState.retryCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {errorState.retryCount} retry attempts
            </Badge>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
