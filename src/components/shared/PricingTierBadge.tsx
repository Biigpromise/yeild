import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

const TIER_LABELS: Record<string, { name: string; color: string }> = {
  micro: { name: 'Micro', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
  standard: { name: 'Standard', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
  priority: { name: 'Priority', color: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  field_standard: { name: 'Field — Standard', color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
  field_high_value: { name: 'Field — High Value', color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
  audit: { name: 'Audit / Specialist', color: 'bg-rose-500/10 text-rose-700 border-rose-500/30' },
};

interface PricingTierBadgeProps {
  tier?: string | null;
  isRush?: boolean;
  size?: 'sm' | 'md';
}

export const PricingTierBadge: React.FC<PricingTierBadgeProps> = ({ tier, isRush, size = 'sm' }) => {
  if (!tier) return null;
  const label = TIER_LABELS[tier];
  if (!label) return null;

  return (
    <div className="inline-flex items-center gap-1">
      <Badge
        variant="outline"
        className={`${label.color} ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium gap-1`}
      >
        <Tag className="h-3 w-3" />
        {label.name}
      </Badge>
      {isRush && (
        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30 text-xs">
          Rush +20%
        </Badge>
      )}
    </div>
  );
};

export const formatNGN = (amount: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
