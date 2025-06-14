
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: "small" | "default" | "large";
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  text = "Loading...", 
  className = "",
  size = "default"
}) => {
  const iconSize = size === "small" ? "h-3 w-3" : size === "large" ? "h-6 w-6" : "h-4 w-4";
  const textSize = size === "small" ? "text-xs" : size === "large" ? "text-base" : "text-sm";
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className={`${iconSize} animate-spin`} />
        {text && <span className={textSize}>{text}</span>}
      </div>
    </div>
  );
};
