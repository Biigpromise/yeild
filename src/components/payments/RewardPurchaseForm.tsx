import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Gift, Star, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

interface RewardPurchaseFormProps {
  reward: Reward;
  userPoints: number;
  onPurchaseComplete?: () => void;
}

export const RewardPurchaseForm: React.FC<RewardPurchaseFormProps> = ({
  reward,
  userPoints,
  onPurchaseComplete
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'cash'>('points');
  const { toast } = useToast();
  const { user } = useAuth();

  const totalPointsRequired = reward.points_required * quantity;
  const hasEnoughPoints = userPoints >= totalPointsRequired;
  const cashPrice = Math.ceil(reward.points_required * 0.1); // 1 point = ₦0.10
  const totalCashPrice = cashPrice * quantity;

  const handleRewardPurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase rewards",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'points') {
      await handlePointsRedemption();
    } else {
      await handleCashPayment();
    }
  };

  const handlePointsRedemption = async () => {
    if (!hasEnoughPoints) {
      toast({
        title: "Insufficient Points",
        description: `You need ${totalPointsRequired - userPoints} more points for this reward`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_user_id: user.id,
        p_reward_id: reward.id
      });

      if (error) throw error;

      toast({
        title: "Reward Redeemed Successfully!",
        description: `You've redeemed ${reward.title} using ${totalPointsRequired} points`,
      });

      onPurchaseComplete?.();
    } catch (error) {
      console.error('Reward redemption error:', error);
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem reward",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('flutterwave-payment', {
        body: {
          amount: totalCashPrice,
          email: user.email,
          name: user.email?.split('@')[0] || 'User',
          phone: '+2348000000000', // Default phone number
          payment_type: 'reward_purchase',
          currency: 'NGN',
          reward_id: reward.id,
          quantity: quantity,
          redirect_url: `${window.location.origin}/rewards?purchase=success`
        }
      });

      if (error) throw error;

      if (data?.payment_link) {
        toast({
          title: "Redirecting to Payment",
          description: "Opening secure payment window...",
        });
        
        // Redirect to Flutterwave payment page
        window.location.href = data.payment_link;
      }
    } catch (error) {
      console.error('Reward purchase error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate reward purchase",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reward Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Reward Purchase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {reward.image_url && (
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                <img 
                  src={reward.image_url} 
                  alt={reward.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{reward.title}</h3>
              <p className="text-muted-foreground text-sm">{reward.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{reward.reward_type}</Badge>
                {reward.reward_value && (
                  <Badge variant="secondary">Value: {reward.reward_value}</Badge>
                )}
              </div>
            </div>
          </div>

          {reward.stock_quantity !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>{reward.stock_quantity} items in stock</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Options */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Method Selection */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={paymentMethod === 'points' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('points')}
              className="h-auto p-4"
            >
              <div className="text-center">
                <Star className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Use Points</div>
                <div className="text-sm opacity-80">{reward.points_required} points</div>
              </div>
            </Button>
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className="h-auto p-4"
            >
              <div className="text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Pay Cash</div>
                <div className="text-sm opacity-80">₦{cashPrice}</div>
              </div>
            </Button>
          </div>

          {/* Quantity Selection */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={reward.stock_quantity || 10}
            />
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h4 className="font-medium">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{reward.title} × {quantity}</span>
                <span>
                  {paymentMethod === 'points' 
                    ? `${totalPointsRequired} points`
                    : `₦${totalCashPrice}`
                  }
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>
                {paymentMethod === 'points' 
                  ? `${totalPointsRequired} points`
                  : `₦${totalCashPrice}`
                }
              </span>
            </div>

            {paymentMethod === 'points' && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Your Points Balance</span>
                <span>{userPoints} points</span>
              </div>
            )}
          </div>

          {/* Warnings */}
          {paymentMethod === 'points' && !hasEnoughPoints && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Insufficient points. You need {totalPointsRequired - userPoints} more points.</span>
            </div>
          )}

          {reward.stock_quantity !== null && reward.stock_quantity < quantity && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Only {reward.stock_quantity} items available in stock.</span>
            </div>
          )}

          {/* Purchase Button */}
          <Button
            onClick={handleRewardPurchase}
            disabled={
              loading || 
              !reward.is_active ||
              (paymentMethod === 'points' && !hasEnoughPoints) ||
              (reward.stock_quantity !== null && reward.stock_quantity < quantity)
            }
            className="w-full"
            size="lg"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                {paymentMethod === 'points' ? (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Redeem with Points
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₦{totalCashPrice}
                  </>
                )}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {paymentMethod === 'points' 
              ? "Points will be deducted immediately upon redemption."
              : "Payments are processed securely by Flutterwave."
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};