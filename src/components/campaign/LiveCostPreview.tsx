import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { type ExecutionMode, calculatePlatformFee, getCampaignCreationFee, EXECUTION_MODES } from '@/types/execution';

interface LiveCostPreviewProps {
  budget: number;
  mode: ExecutionMode;
}

export const LiveCostPreview: React.FC<LiveCostPreviewProps> = ({ budget, mode }) => {
  const modeConfig = EXECUTION_MODES.find((m) => m.id === mode);
  const feePercent = modeConfig ? Math.round((modeConfig.platformFeeMin + modeConfig.platformFeeMax) / 2) : 15;

  // Treat the brand's funded budget as the total they're paying.
  // Operator payout = budget - platform fee taken from that total.
  const platformFee = Math.round((budget * feePercent) / 100);
  const operatorPayout = budget - platformFee;
  const creationFee = getCampaignCreationFee(mode);
  const grandTotal = budget + creationFee;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Operator payout pool" value={operatorPayout} muted />
        <Row label={`Platform fee (~${feePercent}%)`} value={platformFee} muted />
        <div className="border-t border-border pt-2">
          <Row label="Funded budget" value={budget} bold />
        </div>
        <Row label={`One-time creation fee (${mode === 'field' ? 'Field' : 'Digital'})`} value={creationFee} muted />
        <div className="border-t border-border pt-2">
          <Row label="Total charged to wallet" value={grandTotal} bold highlight />
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Final platform fee (10–20%) is set per order based on risk profile. This preview uses the mid-range estimate.
        </p>
      </CardContent>
    </Card>
  );
};

const Row: React.FC<{ label: string; value: number; muted?: boolean; bold?: boolean; highlight?: boolean }> = ({
  label,
  value,
  muted,
  bold,
  highlight,
}) => (
  <div className="flex items-center justify-between">
    <span className={muted ? 'text-muted-foreground' : 'text-foreground'}>{label}</span>
    <span className={`${bold ? 'font-bold' : 'font-medium'} ${highlight ? 'text-primary' : 'text-foreground'}`}>
      ₦{value.toLocaleString()}
    </span>
  </div>
);
