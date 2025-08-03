import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Shield, Zap, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSourceBadgeEnhancedProps {
  taskSource: string;
  brandName?: string;
  brandLogo?: string;
  originalBudget?: number;
  points?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBudget?: boolean;
}

export const TaskSourceBadgeEnhanced: React.FC<TaskSourceBadgeEnhancedProps> = ({
  taskSource,
  brandName,
  brandLogo,
  originalBudget,
  points,
  className,
  size = 'md',
  showBudget = false
}) => {
  const isPlatform = taskSource === 'platform';
  const isBrandCampaign = taskSource === 'brand_campaign';

  const sizeClasses = {
    sm: 'text-xs h-6',
    md: 'text-sm h-8',
    lg: 'text-base h-10'
  };

  if (isPlatform) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge 
          variant="secondary" 
          className={cn(
            "bg-gradient-to-r from-blue-500/10 to-blue-600/20 text-blue-700 border-blue-200",
            "dark:from-blue-900/20 dark:to-blue-800/30 dark:text-blue-400 dark:border-blue-800",
            "hover:from-blue-500/20 hover:to-blue-600/30 transition-all duration-200",
            sizeClasses[size]
          )}
        >
          <Shield className={cn("mr-1", size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />
          Platform Task
          {size === 'lg' && <Crown className="h-3 w-3 ml-1 text-blue-500" />}
        </Badge>
        {showBudget && points && (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {points} pts
          </Badge>
        )}
      </div>
    );
  }

  if (isBrandCampaign) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Premium Brand Badge */}
        <Badge 
          variant="secondary"
          className={cn(
            "bg-gradient-to-r from-orange-500/10 via-orange-400/15 to-yellow-500/10",
            "text-orange-700 border border-orange-200 hover:border-orange-300",
            "dark:from-orange-900/20 dark:via-orange-800/25 dark:to-yellow-900/20",
            "dark:text-orange-400 dark:border-orange-800",
            "hover:shadow-md hover:scale-105 transition-all duration-200",
            "relative overflow-hidden",
            sizeClasses[size]
          )}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          -skew-x-12 animate-shimmer opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          <Building2 className={cn("mr-1 relative z-10", size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />
          <span className="relative z-10 font-semibold">Brand Sponsored</span>
          <Star className={cn("ml-1 relative z-10 text-orange-500", size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        </Badge>

        {/* Brand Info */}
        {brandName && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-950/20 rounded-md border border-orange-100 dark:border-orange-900/30">
            {brandLogo && (
              <Avatar className={cn(size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6')}>
                <AvatarImage src={brandLogo} alt={brandName} />
                <AvatarFallback className="text-xs font-semibold bg-orange-100 text-orange-700">
                  {brandName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span className={cn(
              "font-medium text-orange-700 dark:text-orange-400",
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
            )}>
              {brandName}
            </span>
          </div>
        )}

        {/* Budget/Points Display */}
        {showBudget && (originalBudget || points) && (
          <div className="flex items-center gap-1">
            {originalBudget && originalBudget > (points || 0) && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                ₦{originalBudget.toLocaleString()} budget
              </Badge>
            )}
            {points && (
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0">
                {points} pts
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1", className, sizeClasses[size])}>
      <Zap className={cn(size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />
      {taskSource}
    </Badge>
  );
};