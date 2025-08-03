import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskSourceBadgeProps {
  taskSource: string;
  brandName?: string;
  brandLogo?: string;
  className?: string;
}

export const TaskSourceBadge: React.FC<TaskSourceBadgeProps> = ({
  taskSource,
  brandName,
  brandLogo,
  className
}) => {
  const isPlatform = taskSource === 'platform';
  const isBrandCampaign = taskSource === 'brand_campaign';

  if (isPlatform) {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
          "dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          className
        )}
      >
        <Shield className="h-3 w-3 mr-1" />
        Platform Task
      </Badge>
    );
  }

  if (isBrandCampaign) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge 
          variant="secondary"
          className={cn(
            "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
            "dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
          )}
        >
          <Building2 className="h-3 w-3 mr-1" />
          Brand Sponsored
        </Badge>
        {brandName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {brandLogo && (
              <img 
                src={brandLogo} 
                alt={brandName}
                className="w-4 h-4 rounded object-cover"
              />
            )}
            <span>by {brandName}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      <Zap className="h-3 w-3 mr-1" />
      {taskSource}
    </Badge>
  );
};