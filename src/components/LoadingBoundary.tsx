import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string;
}

const DefaultLoader: React.FC<{ height?: string }> = ({ height = "min-h-[200px]" }) => (
  <div className={`${height} flex items-center justify-center`}>
    <Card>
      <CardContent className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </CardContent>
    </Card>
  </div>
);

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  height
}) => {
  return (
    <Suspense fallback={fallback || <DefaultLoader height={height} />}>
      {children}
    </Suspense>
  );
};