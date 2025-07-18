
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CompactBirdBatchProps {
  count: number;
  className?: string;
}

export const CompactBirdBatch: React.FC<CompactBirdBatchProps> = ({ 
  count, 
  className = '' 
}) => {
  const getBirdEmoji = (taskCount: number) => {
    if (taskCount >= 100) return '🦅';
    if (taskCount >= 50) return '🦜';
    if (taskCount >= 20) return '🐦';
    if (taskCount >= 5) return '🐤';
    return '🐣';
  };

  const getBirdLevel = (taskCount: number) => {
    if (taskCount >= 100) return 'Eagle';
    if (taskCount >= 50) return 'Parrot';
    if (taskCount >= 20) return 'Robin';
    if (taskCount >= 5) return 'Chick';
    return 'Egg';
  };

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 px-2 py-1 ${className}`}
    >
      <span className="text-sm">{getBirdEmoji(count)}</span>
      <span className="text-xs">{getBirdLevel(count)}</span>
    </Badge>
  );
};
