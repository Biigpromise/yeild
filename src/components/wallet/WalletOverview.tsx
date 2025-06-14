
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WithdrawalForm } from "./WithdrawalForm";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { MultiCurrencyPayment } from "./MultiCurrencyPayment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  TrendingUp, 
  Download, 
  CreditCard,
  RefreshCw,
  Globe
} from "lucide-react";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { currencyService } from "@/services/currencyService";

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
  const [userCurrency, setUserCurrency] = useState('USD');

  useEffect(() => {
    // Detect user's currency based on location
    currencyService.getUserCountryFromIP().then(countryCode => {
      const countries = currencyService.getSupportedCountries();
      const country = countries.find(c => c.code === countryCode);
      if (country) {
        setUserCurrency(country.currency.code);
      }
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh will be handled by parent component
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleWithdrawalSubmitted = () => {
    // This will be handled by parent component via callback
    window.location.reload();
  };

  const usdValue = currencyService.pointsToUSD(userPoints);
  const localValue = currencyService.pointsToLocalCurrency(userPoints, userCurrency);

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-muted-foreground">USD Value</p>
                <p className="text-2xl font-bold">${usdValue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Local Value</p>
                <p className="text-2xl font-bold">
                  {currencyService.formatCurrency(localValue, userCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Exchange Rate</p>
                  <p className="text-lg font-bold">1000 pts = $1</p>
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
          <MultiCurrencyPayment />
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
          <CardTitle>Global Payment System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supported Countries</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Nigeria (NGN) - Paystack</li>
                <li>• United States (USD) - Stripe</li>
                <li>• United Kingdom (GBP) - Stripe</li>
                <li>• Kenya (KES) - Paystack</li>
                <li>• South Africa (ZAR) - Paystack</li>
                <li>• Germany (EUR) - Stripe</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Global Features</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Universal points system</li>
                <li>• Real-time currency conversion</li>
                <li>• Local payment methods</li>
                <li>• Secure multi-currency withdrawals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
