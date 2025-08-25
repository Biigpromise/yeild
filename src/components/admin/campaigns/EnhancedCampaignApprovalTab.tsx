import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Zap, Settings, Eye, DollarSign } from "lucide-react";
import { BrandCampaignDetailsDialog } from "../brands/BrandCampaignDetailsDialog";
import { CampaignToTaskConverter } from "./CampaignToTaskConverter";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EnhancedCampaignApprovalTab: React.FC = () => {
  const { campaigns, loading, fetchBrandCampaigns } = useBrandCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [converterDialogOpen, setConverterDialogOpen] = useState(false);
  const [processingCampaign, setProcessingCampaign] = useState<string | null>(null);

  const pendingCampaigns = campaigns.filter(c => c.admin_approval_status === 'pending');
  const approvedCampaigns = campaigns.filter(c => c.admin_approval_status === 'approved');
  const rejectedCampaigns = campaigns.filter(c => c.admin_approval_status === 'rejected');

  const handleApprove = async (campaignId: string) => {
    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase.functions.invoke('campaign-workflow', {
        body: {
          campaign_id: campaignId,
          action: 'approve',
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      toast.success("Campaign approved successfully!");
      fetchBrandCampaigns();
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve campaign");
    } finally {
      setProcessingCampaign(null);
    }
  };

  const handleFundCampaign = async (campaign: any) => {
    setProcessingCampaign(campaign.id);
    try {
      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('brand_wallets')
        .select('balance')
        .eq('brand_id', campaign.brand_id)
        .single();

      if (walletError) {
        toast.error('Failed to check wallet balance');
        return;
      }

      if (!wallet || wallet.balance < campaign.budget) {
        toast.error(`Insufficient wallet balance. Required: ₦${campaign.budget}, Available: ₦${wallet?.balance || 0}`);
        return;
      }

      // Process wallet transaction
      const { data: transaction, error: transactionError } = await supabase
        .rpc('process_wallet_transaction', {
          p_brand_id: campaign.brand_id,
          p_transaction_type: 'campaign_charge',
          p_amount: campaign.budget,
          p_description: `Campaign funding: ${campaign.title}`,
          p_campaign_id: campaign.id
        });

      if (transactionError) {
        toast.error('Failed to process wallet transaction');
        return;
      }

      // Update campaign with funding details
      const { error: updateError } = await supabase
        .from('brand_campaigns')
        .update({
          funded_amount: campaign.budget,
          payment_status: 'paid',
          wallet_transaction_id: transaction
        })
        .eq('id', campaign.id);

      if (updateError) {
        toast.error('Failed to update campaign funding status');
        return;
      }

      toast.success('Campaign funded successfully!');
      fetchBrandCampaigns();
    } catch (error) {
      console.error('Funding error:', error);
      toast.error('Failed to fund campaign');
    } finally {
      setProcessingCampaign(null);
    }
  };

  const handleReject = async (campaignId: string, reason: string) => {
    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase.functions.invoke('campaign-workflow', {
        body: {
          campaign_id: campaignId,
          action: 'reject',
          reason,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      toast.success("Campaign rejected with refund processed");
      fetchBrandCampaigns();
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error("Failed to reject campaign");
    } finally {
      setProcessingCampaign(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderCampaignCard = (campaign: any) => (
    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{campaign.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusColor(campaign.admin_approval_status)}>
                {campaign.admin_approval_status}
              </Badge>
              {campaign.converted_to_tasks && (
                <Badge variant="outline" className="text-success border-success">
                  <Zap className="h-3 w-3 mr-1" />
                  Task Created
                </Badge>
              )}
              {campaign.auto_convert_enabled && (
                <Badge variant="outline">
                  Auto-Convert
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
          </div>
          {campaign.logo_url && (
            <img
              src={campaign.logo_url}
              alt="Brand logo"
              className="w-12 h-12 object-cover rounded-lg ml-3"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium">Budget:</span> ₦{campaign.budget?.toLocaleString() || 0}
            </div>
            <div className="text-blue-600">
              <span className="font-medium">Funded:</span> ₦{campaign.funded_amount?.toLocaleString() || 0}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(campaign.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCampaign(campaign);
              setDetailsDialogOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>

          {campaign.admin_approval_status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(campaign.id)}
                disabled={processingCampaign === campaign.id}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(campaign.id, "Did not meet requirements")}
                disabled={processingCampaign === campaign.id}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              {campaign.payment_status !== 'paid' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleFundCampaign(campaign)}
                  disabled={processingCampaign === campaign.id}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Fund Campaign
                </Button>
              )}
            </>
          )}

          {campaign.admin_approval_status === 'approved' && !campaign.converted_to_tasks && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCampaign(campaign);
                setConverterDialogOpen(true);
              }}
            >
              <Settings className="h-4 w-4 mr-1" />
              Convert to Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Campaign Approval & Management</h2>
          <div className="flex gap-2">
            <Badge variant="outline">
              {pendingCampaigns.length} Pending
            </Badge>
            <Badge variant="outline">
              {approvedCampaigns.length} Approved
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedCampaigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No pending campaigns</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingCampaigns.map(renderCampaignCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No approved campaigns</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {approvedCampaigns.map(renderCampaignCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No rejected campaigns</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rejectedCampaigns.map(renderCampaignCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Campaign Details Dialog */}
      <BrandCampaignDetailsDialog
        campaign={selectedCampaign}
        isOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedCampaign(null);
        }}
        onApprove={selectedCampaign ? () => handleApprove(selectedCampaign.id) : undefined}
        onReject={selectedCampaign ? (reason: string) => handleReject(selectedCampaign.id, reason) : undefined}
      />

      {/* Campaign to Task Converter Dialog */}
      <Dialog open={converterDialogOpen} onOpenChange={setConverterDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Convert Campaign to Task</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <CampaignToTaskConverter
              campaign={selectedCampaign}
              onConversionComplete={() => {
                setConverterDialogOpen(false);
                setSelectedCampaign(null);
                fetchBrandCampaigns();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};