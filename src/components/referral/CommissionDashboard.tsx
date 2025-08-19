import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Info } from 'lucide-react';
import { toast } from 'sonner';
import { referralCommissionService } from '@/services/referralCommissionService';
import { useAuth } from '@/contexts/AuthContext';

interface CommissionData {
  points: number;
  created_at: string;
  description: string | null;
}

export const CommissionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [commissionEarnings, setCommissionEarnings] = useState<CommissionData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommissionData();
  }, [user]);

  const loadCommissionData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [earnings, total] = await Promise.all([
        referralCommissionService.getCommissionEarnings(user.id),
        referralCommissionService.getTotalCommissionEarnings(user.id)
      ]);

      setCommissionEarnings(earnings);
      setTotalEarnings(total);
    } catch (error) {
      console.error('Error loading commission data:', error);
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading commission data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Commission Overview */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="bg-green-100">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Referral Commission Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Total Commission Earned</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{totalEarnings} points</div>
              <p className="text-xs text-green-600">From your referrals' task completions</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Commission Transactions</span>
              </div>
              <div className="text-2xl font-bold text-green-800">{commissionEarnings.length}</div>
              <p className="text-xs text-green-600">Total commission payments received</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How Commission Works:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>You earn commission when your referred users complete tasks</li>
                  <li>Commission rates vary by your bird level (higher levels = more commission)</li>
                  <li>Payments are automatic and added to your points balance</li>
                  <li>Track all your commission earnings in the history below</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commission History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Commission Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissionEarnings.length > 0 ? (
            <div className="space-y-3">
              {commissionEarnings.slice(0, 10).map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{earning.description || 'Commission Payment'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-green-600">
                      +{earning.points} points
                    </Badge>
                  </div>
                </div>
              ))}
              
              {commissionEarnings.length > 10 && (
                <div className="text-center pt-4 border-t">
                  <Button variant="outline" onClick={loadCommissionData}>
                    Load More History
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No commission earnings yet</p>
              <p className="text-sm mt-2">Start referring users to earn commission from their task completions!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};