
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ModernBrandLayout } from '@/components/brand/ModernBrandLayout';
import { ProfessionalDashboardOverview } from '@/components/brand/dashboard/ProfessionalDashboardOverview';
import { BrandSettings } from '@/components/brand/dashboard/BrandSettings';
import { CreateCampaignDialog } from '@/components/brand/CreateCampaignDialog';
import { BrandWalletFundingDialog } from '@/components/brand/BrandWalletFundingDialog';
import { BrandCampaignManager } from '@/components/brand/dashboard/BrandCampaignManager';
import { BrandAudienceInsights } from '@/components/brand/dashboard/BrandAudienceInsights';
import { BrandCreativeStudio } from '@/components/brand/dashboard/BrandCreativeStudio';
import { BrandFinancialHub } from '@/components/brand/dashboard/BrandFinancialHub';
import { BrandAnalytics } from '@/components/brand/dashboard/BrandAnalytics';
import { BrandSupport } from '@/components/brand/dashboard/BrandSupport';
import { toast } from 'sonner';

const BrandDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFundingDialogOpen, setIsFundingDialogOpen] = useState(false);
  const navigate = useNavigate();

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
    <ModernBrandLayout profile={profile} wallet={wallet}>
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
          element={<BrandCampaignManager />}
        />
        <Route
          path="/audience"
          element={<BrandAudienceInsights />}
        />
        <Route
          path="/creative"
          element={<BrandCreativeStudio />}
        />
        <Route
          path="/finance"
          element={<BrandFinancialHub />}
        />
        <Route
          path="/analytics"
          element={<BrandAnalytics />}
        />
        <Route
          path="/support"
          element={<BrandSupport />}
        />
        <Route
          path="/settings"
          element={<BrandSettings profile={profile} />}
        />
      </Routes>
      
      <CreateCampaignDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
      
      <BrandWalletFundingDialog
        open={isFundingDialogOpen}
        onOpenChange={setIsFundingDialogOpen}
        onFundingComplete={handleFundingComplete}
      />
    </ModernBrandLayout>
  );
};

export default BrandDashboard;
