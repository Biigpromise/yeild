
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  text = "Loading...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{text}</span>
      </div>
    </div>
  );
};
