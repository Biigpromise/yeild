import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  PenTool,
  Target,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Repeat,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { getJobCategory } from '@/types/jobCategories';

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  PenTool,
  Target,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Repeat,
  Briefcase,
};

interface JobCategoryBadgeProps {
  code?: string | null;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const JobCategoryBadge: React.FC<JobCategoryBadgeProps> = ({
  code,
  size = 'sm',
  showIcon = true,
}) => {
  const category = getJobCategory(code);
  if (!category) return null;
  const Icon = ICON_MAP[category.icon] ?? Briefcase;

  return (
    <Badge
      variant="outline"
      className={`${category.badgeColor} ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      } font-medium gap-1`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {category.name}
    </Badge>
  );
};
