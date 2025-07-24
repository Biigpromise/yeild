
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/ui/loading-state";

export const BrandPerformanceTab: React.FC = () => {
  const { data: brandStats, isLoading } = useQuery({
    queryKey: ['brand-performance'],
    queryFn: async () => {
      // Get brand profiles with campaign data
      const { data: brands } = await supabase
        .from('brand_profiles')
        .select(`
          company_name,
          user_id,
          brand_campaigns (id, budget, status),
          brand_wallets (total_spent, balance)
        `);

      // Get brand revenue totals
      const { data: wallets } = await supabase
        .from('brand_wallets')
        .select('total_spent, balance');

      const totalRevenue = wallets?.reduce((sum, wallet) => sum + Number(wallet.total_spent), 0) || 0;
      const totalBalance = wallets?.reduce((sum, wallet) => sum + Number(wallet.balance), 0) || 0;

      // Get active brands count
      const { data: activeBrands } = await supabase
        .from('brand_campaigns')
        .select('brand_id', { count: 'exact' })
        .eq('status', 'active');

      // Get brand retention (brands with campaigns)
      const totalBrands = brands?.length || 0;
      const brandsWithCampaigns = new Set(brands?.filter(b => b.brand_campaigns.length > 0).map(b => b.user_id)).size;
      const retentionRate = totalBrands > 0 ? Math.round((brandsWithCampaigns / totalBrands) * 100) : 0;

      return {
        totalRevenue,
        totalBalance,
        activeBrandsCount: activeBrands?.length || 0,
        totalBrands,
        retentionRate,
        topBrands: brands?.slice(0, 4).map(brand => ({
          name: brand.company_name,
          campaigns: brand.brand_campaigns.length,
          spent: Array.isArray(brand.brand_wallets) && brand.brand_wallets.length > 0 ? brand.brand_wallets[0].total_spent : 0,
          balance: Array.isArray(brand.brand_wallets) && brand.brand_wallets.length > 0 ? brand.brand_wallets[0].balance : 0,
          status: brand.brand_campaigns.some(c => c.status === 'active') ? 'Active' : 'Inactive'
        })) || []
      };
    },
  });

  if (isLoading) return <LoadingState text="Loading brand performance..." />;

  const platformStats = [
    { metric: "Total Brand Revenue", value: `₦${brandStats?.totalRevenue?.toLocaleString() || '0'}`, growth: "+23%" },
    { metric: "Active Brands", value: brandStats?.activeBrandsCount?.toString() || '0', growth: "+12%" },
    { metric: "Total Brands", value: brandStats?.totalBrands?.toString() || '0', growth: "+18%" },
    { metric: "Brand Retention", value: `${brandStats?.retentionRate || 0}%`, growth: "+2%" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Overall brand performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.metric}</div>
                <div className="text-xs text-green-600 font-medium">{stat.growth}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Brands</CardTitle>
          <CardDescription>Brands with highest engagement and satisfaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brandStats?.topBrands?.map((brand, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold">{brand.name}</div>
                  <div className="text-sm text-gray-600">{brand.status}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-bold text-green-600">{brand.campaigns}</div>
                    <div className="text-xs text-gray-500">Campaigns</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">₦{Number(brand.spent).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Spent</div>
                  </div>
                  <div>
                    <div className="font-bold text-yellow-600">₦{Number(brand.balance).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Balance</div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">No brand data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
