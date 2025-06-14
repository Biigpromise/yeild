
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { NigerianPayment } from "./NigerianPayment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  CreditCard,
  RefreshCw
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { paystackService } from "@/services/paystackService";

interface WalletOverviewProps {
  userPoints: number;
  totalEarned: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  userPoints,
  totalEarned,
  pendingWithdrawals,
  completedWithdrawals
}) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh will be handled by parent component
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleWithdrawalSubmitted = () => {
    // This will be handled by parent component via callback
    window.location.reload();
  };

  const nairaEquivalent = Math.floor(userPoints / 10); // 10 points = ₦1

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Points</p>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Naira Value</p>
                <p className="text-2xl font-bold">{paystackService.formatNaira(nairaEquivalent)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Exchange Rate</p>
                  <p className="text-lg font-bold">10 pts = ₦1</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Actions */}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy">Buy Points</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="buy">
          <NigerianPayment />
        </TabsContent>
        
        <TabsContent value="withdraw">
          <WithdrawalForm 
            userPoints={userPoints} 
            onWithdrawalSubmitted={handleWithdrawalSubmitted}
          />
        </TabsContent>
        
        <TabsContent value="history">
          <WithdrawalHistory />
        </TabsContent>
      </Tabs>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Nigerian Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported Banks</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• All major Nigerian banks</li>
                <li>• GTBank, First Bank, Access Bank</li>
                <li>• UBA, Zenith Bank, Fidelity Bank</li>
                <li>• And many more...</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Payment Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Instant point crediting</li>
                <li>• Secure Paystack integration</li>
                <li>• Multiple payment methods</li>
                <li>• 24/7 transaction support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
