
import React from 'react';
import { WalletSkeleton } from "@/components/ui/dashboard-skeleton";
import { WalletOverview } from "@/components/wallet/WalletOverview";
import { WithdrawalForm } from "@/components/wallet/WithdrawalForm";
import { WithdrawalHistory } from "@/components/wallet/WithdrawalHistory";

interface WalletTabProps {
  loading: boolean;
  userPoints: number;
  totalEarned: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  onWithdrawalSubmitted: () => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  loading,
  userPoints,
  totalEarned,
  pendingWithdrawals,
  completedWithdrawals,
  onWithdrawalSubmitted,
}) => {
  if (loading) {
    return <WalletSkeleton />;
  }

  return (
    <div className="space-y-6">
      <WalletOverview 
        userPoints={userPoints}
        totalEarned={totalEarned}
        pendingWithdrawals={pendingWithdrawals}
        completedWithdrawals={completedWithdrawals}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalForm 
          userPoints={userPoints}
          onWithdrawalSubmitted={onWithdrawalSubmitted}
        />
        <WithdrawalHistory />
      </div>
    </div>
  );
};
