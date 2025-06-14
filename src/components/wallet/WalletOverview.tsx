
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface WalletOverviewProps {
  userPoints: number;
  totalEarned: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
}

export const WalletOverview = ({ 
  userPoints, 
  totalEarned, 
  pendingWithdrawals, 
  completedWithdrawals 
}: WalletOverviewProps) => {
  const cashValue = (userPoints / 100).toFixed(2);
  const totalCashEarned = (totalEarned / 100).toFixed(2);
  const conversionRate = 0.01; // 1 point = $0.01
  const nextMilestone = 5000;
  const progressToMilestone = Math.min((userPoints / nextMilestone) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Balance */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-blue-500" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {userPoints.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ ${cashValue} USD
          </div>
          <Badge variant="outline" className="mt-2">
            1 point = ${conversionRate}
          </Badge>
        </CardContent>
      </Card>

      {/* Total Earned */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Total Earned
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {totalEarned.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ ${totalCashEarned} USD
          </div>
        </CardContent>
      </Card>

      {/* Pending Withdrawals */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {pendingWithdrawals.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            points pending
          </div>
        </CardContent>
      </Card>

      {/* Completed Withdrawals */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Withdrawn
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {completedWithdrawals.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            points withdrawn
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      <Card className="border-0 shadow-sm md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Next Milestone</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Progress to {nextMilestone.toLocaleString()} points
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.min(userPoints, nextMilestone).toLocaleString()} / {nextMilestone.toLocaleString()}
            </span>
          </div>
          <Progress value={progressToMilestone} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {userPoints >= nextMilestone 
              ? "Milestone reached! 🎉" 
              : `${(nextMilestone - userPoints).toLocaleString()} points to unlock bonus rewards`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
