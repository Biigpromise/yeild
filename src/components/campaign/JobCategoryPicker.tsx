import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Briefcase, type LucideIcon } from 'lucide-react';
import {
  Zap,
  PenTool,
  Target,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Repeat,
} from 'lucide-react';
import { JOB_CATEGORIES, type JobCategory, type JobCategoryCode } from '@/types/jobCategories';
import { jobCategoryService } from '@/services/jobCategoryService';
import { Skeleton } from '@/components/ui/skeleton';

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

interface JobCategoryPickerProps {
  value: JobCategoryCode | null;
  onChange: (code: JobCategoryCode, category: JobCategory) => void;
  className?: string;
}

export const JobCategoryPicker: React.FC<JobCategoryPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [categories, setCategories] = useState<JobCategory[]>(JOB_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    jobCategoryService.listActive().then((list) => {
      if (mounted) {
        setCategories(list);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">What kind of work is this?</h3>
        <p className="text-sm text-muted-foreground">
          Pick the category that matches the job. Each one has its own pricing model and bonus rules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((category) => {
          const isSelected = value === category.code;
          const Icon = ICON_MAP[category.icon] ?? Briefcase;
          return (
            <Card
              key={category.code}
              role="button"
              tabIndex={0}
              onClick={() => onChange(category.code, category)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(category.code, category);
                }
              }}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className={`p-1.5 rounded-md ${category.badgeColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-foreground">{category.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-semibold text-foreground">
                      ₦{category.defaultMinNGN.toLocaleString()}–
                      {category.defaultMaxNGN.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{category.effortEstimate}</div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {category.supportsRankMultiplier && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      Rank ×
                    </Badge>
                  )}
                  {category.supportsQualityBonus && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      Quality+
                    </Badge>
                  )}
                  {category.supportsOutcomeBonus && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      Outcome+
                    </Badge>
                  )}
                  {category.supportsCommission && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      % Deal
                    </Badge>
                  )}
                  {category.supportsHourly && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      Hourly
                    </Badge>
                  )}
                  {category.supportsExpenseReimbursement && (
                    <Badge variant="secondary" className="text-[9px] font-normal py-0 px-1.5">
                      Expenses
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
