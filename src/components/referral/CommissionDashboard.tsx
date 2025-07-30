import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  ArrowRight, 
  RefreshCw,
  Calendar,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { referralCommissionService } from '@/services/referralCommissionService';
import { referralService } from '@/services/referralService';
import { toast } from 'sonner';

interface CommissionTransaction {
  points: number;
  created_at: string;
  description: string;
}

interface DownlineUser {
  id: string;
  name: string;
  email: string;
  profile_picture_url?: string;
  points: number;
  tasks_completed: number;
  created_at: string;
  commission_earned: number;
}

export const CommissionDashboard = () => {
  const { user } = useAuth();
  const [commissionEarnings, setCommissionEarnings] = useState<CommissionTransaction[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCommissionData = async (showToast = false) => {
    if (!user) return;

    try {
      setLoading(true);
      const [earnings, total, referrals] = await Promise.all([
        referralCommissionService.getCommissionEarnings(user.id),
        referralCommissionService.getTotalCommissionEarnings(user.id),
        referralService.getUserReferrals(user.id)
      ]);

      setCommissionEarnings(earnings);
      setTotalCommission(total);
      
      // Transform referrals into downline users with commission info
      const downline = referrals
        .filter(ref => ref.is_active)
        .map(ref => ({
          id: ref.referred_id || '',
          name: 'Referred User',
          email: '',
          profile_picture_url: undefined,
          points: 0,
          tasks_completed: 0,
          created_at: ref.created_at,
          commission_earned: earnings
            .reduce((sum, e) => sum + e.points, 0) / Math.max(referrals.filter(r => r.is_active).length, 1)
        }));

      setDownlineUsers(downline);

      if (showToast) {
        toast.success('Commission data refreshed');
      }
    } catch (error) {
      console.error('Error loading commission data:', error);
      if (showToast) {
        toast.error('Failed to refresh commission data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissionData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommissionData(true);
    setRefreshing(false);
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Commission Dashboard
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-800">Total Commission</p>
                  <p className="text-2xl font-bold text-green-900">{totalCommission} pts</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">Active Downline</p>
                  <p className="text-2xl font-bold text-blue-900">{downlineUsers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-800">Commission Rate</p>
                  <p className="text-2xl font-bold text-purple-900">10 pts</p>
                  <p className="text-xs text-purple-600">per downline earning</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="downline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="downline">Your Downline</TabsTrigger>
              <TabsTrigger value="earnings">Commission History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="downline" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Active Downline</h3>
                  <Badge variant="secondary">{downlineUsers.length} members</Badge>
                </div>
                
                {downlineUsers.length > 0 ? (
                  <div className="space-y-3">
                    {downlineUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-slate-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_picture_url} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{user.points} points</span>
                              <span>•</span>
                              <span>{user.tasks_completed} tasks</span>
                              <span>•</span>
                              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Commission:</span>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              +{user.commission_earned || 0} pts
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            10 pts per earning
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No active downline members yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your referred users will appear here once they complete their first task
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="earnings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Commission History</h3>
                  <Badge variant="secondary">{commissionEarnings.length} transactions</Badge>
                </div>
                
                {commissionEarnings.length > 0 ? (
                  <div className="space-y-3">
                    {commissionEarnings.map((earning, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-600">+{earning.points} points</p>
                            <p className="text-sm text-muted-foreground">{earning.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(earning.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No commission earnings yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll earn 10 points for every point your downline earns
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};