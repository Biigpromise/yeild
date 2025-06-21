
import React from "react";

interface CompactBirdBatchProps {
  count: number;
  className?: string;
}

export const CompactBirdBatch: React.FC<CompactBirdBatchProps> = ({ 
  count, 
  className = "" 
}) => {
  // Determine color based on count ranges
  const getBirdColor = (index: number) => {
    if (count >= 100) return "text-yellow-500"; // Gold birds for high achievers
    if (count >= 50) return "text-blue-500";   // Blue birds for medium achievers
    if (count >= 20) return "text-green-500";  // Green birds for active users
    return "text-gray-400";                    // Gray birds for new users
  };

  // Show maximum 5 birds in compact view
  const birdsToShow = Math.min(Math.ceil(count / 10), 5);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: birdsToShow }, (_, index) => (
        <div key={index} className={`text-lg ${getBirdColor(index)}`}>
          🐦
        </div>
      ))}
      {count > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          x{count}
        </span>
      )}
    </div>
  );
};
