
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rewardsService, RewardRedemption } from "@/services/rewardsService";
import { toast } from "sonner";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

export const RedemptionHistory = () => {
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRedemptions();
  }, []);

  const loadRedemptions = async () => {
    try {
      setLoading(true);
      const data = await rewardsService.getUserRedemptions();
      setRedemptions(data);
    } catch (error) {
      console.error("Error loading redemptions:", error);
      toast.error("Failed to load redemption history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Redemption History</h2>
        <p className="text-muted-foreground">Track your reward redemptions and their status</p>
      </div>

      <div className="space-y-4">
        {redemptions.map((redemption) => (
          <Card key={redemption.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{redemption.rewards.title}</h3>
                    <Badge className={getStatusColor(redemption.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(redemption.status)}
                        {redemption.status}
                      </span>
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {redemption.rewards.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Points spent: {redemption.points_spent}</span>
                    <span>•</span>
                    <span>Redeemed: {new Date(redemption.redeemed_at).toLocaleDateString()}</span>
                    {redemption.delivered_at && (
                      <>
                        <span>•</span>
                        <span>Delivered: {new Date(redemption.delivered_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  {redemption.redemption_code && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Redemption Code:</p>
                      <p className="text-lg font-mono">{redemption.redemption_code}</p>
                    </div>
                  )}

                  {redemption.admin_notes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{redemption.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {redemptions.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No redemptions yet</h3>
          <p className="text-gray-500">Start earning points and redeem your first reward!</p>
        </div>
      )}
    </div>
  );
};
