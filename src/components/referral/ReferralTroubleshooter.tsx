import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { referralService } from '@/services/referralService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ReferralTroubleshooter: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshCounts = async () => {
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      await referralService.refreshReferralCounts(user.id);
      toast.success('Referral counts refreshed successfully!');
      // Trigger a page refresh to show updated data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh referral counts');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Referral Not Counting?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-2">If someone signed up with your referral link but it's not showing:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>The user needs to complete at least 1 task OR earn 50 points to activate</li>
            <li>Referral counts update automatically, but you can manually refresh below</li>
            <li>Both signup and task completion must happen for activation</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleRefreshCounts}
          disabled={refreshing}
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="sm"
        >
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Refresh My Referral Counts
            </>
          )}
        </Button>
        
        <div className="text-xs text-orange-600">
          💡 This will recalculate your referral statistics and update your counts.
        </div>
      </CardContent>
    </Card>
  );
};