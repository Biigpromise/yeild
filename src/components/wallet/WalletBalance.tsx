
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  totalEarned,
  totalSpent
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100">Current Balance</CardTitle>
          <Wallet className="h-4 w-4 text-blue-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">₦{balance.toLocaleString()}</div>
          <p className="text-xs text-blue-100 mt-1">Available to spend</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-100">Total Earned</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">₦{totalEarned.toLocaleString()}</div>
          <p className="text-xs text-green-100 mt-1">Lifetime earnings</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-600 to-pink-700 text-white border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-100">Total Spent</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-200" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">₦{totalSpent.toLocaleString()}</div>
          <p className="text-xs text-red-100 mt-1">Total expenses</p>
        </CardContent>
      </Card>
    </div>
  );
};
