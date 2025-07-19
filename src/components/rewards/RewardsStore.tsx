
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rewardsService, Reward } from "@/services/rewardsService";
import { toast } from "sonner";
import { Coins, Gift, Star, Package } from "lucide-react";

interface RewardsStoreProps {
  userPoints: number;
  onRedemption?: () => void;
}

export const RewardsStore = ({ userPoints, onRedemption }: RewardsStoreProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await rewardsService.getRewards();
      setRewards(data);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const redemptionId = await rewardsService.redeemReward(rewardId);
      toast.success("Reward redeemed successfully!");
      onRedemption?.();
      loadRewards(); // Refresh to update stock
    } catch (error: any) {
      console.error("Error redeeming reward:", error);
      toast.error(error.message || "Failed to redeem reward");
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'digital':
        return <Gift className="h-5 w-5" />;
      case 'badge':
        return <Star className="h-5 w-5" />;
      case 'physical':
        return <Package className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'digital':
        return 'bg-blue-100 text-blue-800';
      case 'badge':
        return 'bg-purple-100 text-purple-800';
      case 'physical':
        return 'bg-green-100 text-green-800';
      case 'discount':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rewards Store</h2>
          <p className="text-muted-foreground">Redeem your points for amazing rewards</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
          <Coins className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">{userPoints} Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const canAfford = userPoints >= reward.points_required;
          const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
          
          return (
            <Card key={reward.id} className={`${!canAfford || isOutOfStock ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRewardIcon(reward.reward_type)}
                    <Badge className={getRewardTypeColor(reward.reward_type)}>
                      {reward.reward_type}
                    </Badge>
                  </div>
                  {reward.stock_quantity !== null && (
                    <Badge variant={reward.stock_quantity > 0 ? "secondary" : "destructive"}>
                      {reward.stock_quantity > 0 ? `${reward.stock_quantity} left` : 'Out of Stock'}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reward.image_url && (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src={reward.image_url} 
                      alt={reward.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">{reward.points_required} points</span>
                  </div>
                  
                  <Button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || isOutOfStock || redeeming === reward.id}
                    size="sm"
                  >
                    {redeeming === reward.id ? "Redeeming..." : 
                     isOutOfStock ? "Out of Stock" :
                     !canAfford ? "Not Enough Points" : "Redeem"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards available</h3>
          <p className="text-gray-500">Check back later for new rewards!</p>
        </div>
      )}
    </div>
  );
};
