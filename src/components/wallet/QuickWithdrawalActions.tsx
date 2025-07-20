
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  Zap, 
  Building2, 
  Smartphone,
  Clock
} from "lucide-react";
import { QuickWithdrawButton } from "./QuickWithdrawButton";

interface QuickWithdrawalActionsProps {
  userPoints: number;
  onStartWithdrawal: (method: string) => void;
}

export const QuickWithdrawalActions: React.FC<QuickWithdrawalActionsProps> = ({
  userPoints,
  onStartWithdrawal
}) => {
  const minWithdrawal = 1000;
  const canWithdraw = userPoints >= minWithdrawal;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-5 w-5 text-yeild-yellow" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {canWithdraw ? (
            <QuickWithdrawButton userPoints={userPoints} />
          ) : (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <ArrowUpRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Minimum withdrawal: {minWithdrawal.toLocaleString()} points</p>
              <p className="text-xs text-muted-foreground">
                You need {(minWithdrawal - userPoints).toLocaleString()} more points
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onStartWithdrawal('flutterwave')}
            className="w-full"
          >
            Full Withdrawal Options
          </Button>
        </div>

        {/* Withdrawal Info */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Smartphone className="h-3 w-3 text-green-500" />
            <span>Digital banks (OPay, Moniepoint): Instant</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-blue-500" />
            <span>Traditional banks: 1-3 business days</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-orange-500" />
            <span>Processing fee: 5% of withdrawal amount</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
