
import React from "react";
import { Loader } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text = "Loading...",
  size = "medium", 
  className = "",
}) => {
  const getSize = () => {
    switch(size) {
      case "small": return "h-4 w-4";
      case "large": return "h-8 w-8";
      default: return "h-6 w-6";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader className={`animate-spin ${getSize()}`} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
