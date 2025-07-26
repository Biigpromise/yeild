
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface WalletCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    type: 'up' | 'down';
  };
  currency?: string;
}

const WalletCard = ({ title, amount, icon, trend, currency = "₦" }: WalletCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-200">{title}</CardTitle>
        <div className="text-slate-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-1">
          {currency}{amount.toLocaleString()}
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${
            trend.type === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend.type === 'up' ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
