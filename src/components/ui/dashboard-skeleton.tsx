
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-2 text-center">
                  <Skeleton className="h-6 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              {/* Filter Skeleton */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-20" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Categories Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                      <Skeleton className="h-4 w-16 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick Actions Skeleton */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity Skeleton */}
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-28" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WalletSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Wallet Overview Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Withdrawal History Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
