
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Gift, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralMonitoring } from '@/hooks/useReferralMonitoring';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingFallback } from '@/components/ui/loading-fallback';
import { referralService } from '@/services/referralService';
import { referralCommissionService } from '@/services/referralCommissionService';
import { toast } from 'sonner';
import { generateReferralLink, APP_CONFIG } from "@/config/app";
import { BirdProgressTracker } from "@/components/referral/BirdProgressTracker";

export const EnhancedReferralsTab: React.FC = () => {
  const { user } = useAuth();
  const { errorState, handleError, retry, clearError } = useErrorRecovery();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0
  });
  const [commissionEarnings, setCommissionEarnings] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use the fixed referral monitoring hook
  const { isConnected, connectionError } = useReferralMonitoring();

  const loadReferralStats = async (showToast = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      clearError();
      
      const [stats, earnings, total] = await Promise.allSettled([
        referralService.getReferralStats(user.id),
        referralCommissionService.getCommissionEarnings(user.id),
        referralCommissionService.getTotalCommissionEarnings(user.id)
      ]);
      
      // Handle stats result
      if (stats.status === 'fulfilled' && stats.value) {
        setReferralStats(stats.value);
      } else {
        console.warn('Failed to load referral stats:', stats.status === 'rejected' ? stats.reason : 'No data');
      }
      
      // Handle earnings result
      if (earnings.status === 'fulfilled') {
        setCommissionEarnings(earnings.value || []);
      } else {
        console.warn('Failed to load commission earnings:', earnings.reason);
        setCommissionEarnings([]);
      }
      
      // Handle total result
      if (total.status === 'fulfilled') {
        setTotalCommission(total.value || 0);
      } else {
        console.warn('Failed to load total commission:', total.reason);
        setTotalCommission(0);
      }
      
      if (showToast) {
        toast.success('Referral data refreshed');
      }
    } catch (error) {
      console.error('Error in loadReferralStats:', error);
      handleError(error as Error, 'loading referral stats');
      if (showToast) {
        toast.error('Failed to refresh referral data');
      }
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
      // First refresh referral counts in database
      if (user?.id) {
        await referralService.refreshReferralCounts(user.id);
      }
      await loadReferralStats(true);
    } finally {
      setRefreshing(false);
    }
  };

  const copyReferralLink = async () => {
    if (!user?.id) return;
    
    try {
      const referralLink = generateReferralLink(user.id);
      await navigator.clipboard.writeText(referralLink);
      toast.success('Professional referral link copied!');
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
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
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
        <Card className={`${connectionError ? 'border-yellow-200 bg-yellow-50' : isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className={isConnected ? 'text-green-700' : 'text-yellow-700'}>
                    {isConnected ? 'Connected' : 'Connection Issues'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {connectionError || (isConnected ? 'Real-time updates active' : 'Limited connectivity')}
                </p>
              </div>
              {!isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-sm text-muted-foreground">Commission Earned</p>
                  <p className="text-2xl font-bold">{totalCommission} pts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Downline Activity</p>
                  <p className="text-2xl font-bold">{commissionEarnings.length}</p>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bird Progress Tracker - Phoenix Display */}
        {user && (
          <BirdProgressTracker 
            userId={user.id} 
            showCompactView={false}
            className="transition-all duration-300 hover:shadow-md" 
          />
        )}

        {/* Commission Earnings */}
        {commissionEarnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Commission Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commissionEarnings.slice(0, 5).map((earning, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">+{earning.points} points commission</p>
                      <p className="text-xs text-muted-foreground">{earning.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {commissionEarnings.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    And {commissionEarnings.length - 5} more transactions...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Link Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Professional Referral Link</span>
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
                  {generateReferralLink(user?.id || '')}
                </code>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-sm text-green-800">
                  <p><strong>✓ Professional Domain:</strong> {APP_CONFIG.getDisplayDomain()}</p>
                  <p className="text-xs mt-1">Your referral links use your professional domain for better conversion rates!</p>
                </div>
              </div>
              <Button onClick={copyReferralLink} className="w-full">
                Copy Professional Referral Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
