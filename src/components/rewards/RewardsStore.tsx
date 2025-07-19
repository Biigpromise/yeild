
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, CreditCard, Sparkles, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  reward_type: string;
  reward_value: string;
  image_url?: string;
  stock_quantity?: number;
  is_active: boolean;
}

interface RewardsStoreProps {
  userPoints: number;
  onRedemption: () => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({ userPoints, onRedemption }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required');

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.points_required) {
      toast.error('Not enough points for this reward');
      return;
    }

    setRedeeming(reward.id);

    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_reward_id: reward.id
      });

      if (error) throw error;

      toast.success(`Successfully redeemed ${reward.title}! Check your email for details.`);
      onRedemption();
      fetchRewards(); // Refresh to update stock
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'gift_card': return <Gift className="h-5 w-5" />;
      case 'cash': return <CreditCard className="h-5 w-5" />;
      case 'digital': return <Sparkles className="h-5 w-5" />;
      default: return <ShoppingCart className="h-5 w-5" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'gift_card': return 'bg-blue-100 text-blue-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'digital': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Points Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Points Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary mb-2">{userPoints.toLocaleString()} Points</div>
          <p className="text-muted-foreground">Ready to redeem for amazing rewards!</p>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = userPoints >= reward.points_required;
          const outOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;

          return (
            <Card key={reward.id} className={`transition-all ${canAfford && !outOfStock ? 'hover:shadow-lg' : 'opacity-60'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRewardIcon(reward.reward_type)}
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                  </div>
                  <Badge className={getRewardTypeColor(reward.reward_type)}>
                    {reward.reward_type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">{reward.points_required.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points required</div>
                  </div>
                  
                  {reward.reward_value && (
                    <div className="text-right">
                      <div className="text-lg font-semibold">{reward.reward_value}</div>
                      <div className="text-xs text-muted-foreground">value</div>
                    </div>
                  )}
                </div>

                {reward.stock_quantity !== null && (
                  <div className="text-xs text-muted-foreground">
                    {reward.stock_quantity > 0 ? `${reward.stock_quantity} left` : 'Out of stock'}
                  </div>
                )}

                <Button 
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || outOfStock || redeeming === reward.id}
                  className="w-full"
                  variant={canAfford && !outOfStock ? "default" : "outline"}
                >
                  {redeeming === reward.id ? 'Redeeming...' : 
                   outOfStock ? 'Out of Stock' :
                   !canAfford ? `Need ${(reward.points_required - userPoints).toLocaleString()} more points` : 
                   'Redeem Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No rewards available</h3>
            <p className="text-muted-foreground">
              Rewards will appear here once they're added by administrators.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
