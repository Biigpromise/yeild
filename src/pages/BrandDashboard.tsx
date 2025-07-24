
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BrandSidebar } from '@/components/brand/dashboard/BrandSidebar';
import { ProfessionalDashboardOverview } from '@/components/brand/dashboard/ProfessionalDashboardOverview';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandWalletFundingDialog } from '@/components/brand/BrandWalletFundingDialog';
import { toast } from 'sonner';

const BrandDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['brand-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: wallet, refetch: refetchWallet } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleCreateCampaign = () => {
    setIsCreateDialogOpen(true);
  };

  const handleAddFunds = () => {
    setIsFundingDialogOpen(true);
  };

  const handleFundingComplete = () => {
    refetchWallet();
    toast.success('Wallet refreshed');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <BrandSidebar profile={profile} wallet={wallet} />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Routes>
              <Route
                path="/"
                element={
                  <ProfessionalDashboardOverview
                    profile={profile}
                    wallet={wallet}
                    onCreateCampaign={handleCreateCampaign}
                    onAddFunds={handleAddFunds}
                  />
                }
              />
              <Route
                path="/campaigns"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Campaign Manager</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/audience"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Audience Insights</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/creative"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Creative Studio</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/finance"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Financial Hub</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Analytics</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/support"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Help & Support</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
              <Route
                path="/settings"
                element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-foreground mb-4">Settings</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
      
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      
      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={handleFundingComplete}
      />
    </SidebarProvider>
  );
};

export default BrandDashboard;
