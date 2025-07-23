import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar, Target } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  funded_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  admin_approval_status: 'pending' | 'approved' | 'rejected';
  brand_id: string;
  created_at: string;
  brand_profiles: {
    company_name: string;
    industry: string;
  } | null;
}

export const CampaignApprovalManager: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles:brand_id (
            company_name,
            industry
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface with proper null handling
      const transformedData: Campaign[] = (data || []).map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        budget: campaign.budget,
        funded_amount: campaign.funded_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: campaign.status,
        admin_approval_status: campaign.admin_approval_status as 'pending' | 'approved' | 'rejected',
        brand_id: campaign.brand_id,
        created_at: campaign.created_at,
        brand_profiles: campaign.brand_profiles && 
          typeof campaign.brand_profiles === 'object' && 
          !('error' in campaign.brand_profiles) &&
          campaign.brand_profiles !== null
          ? campaign.brand_profiles as { company_name: string; industry: string; }
          : null
      }));
      
      setCampaigns(transformedData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (campaignId: string, approved: boolean) => {
    setProcessingId(campaignId);
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .update({ 
          admin_approval_status: approved ? 'approved' : 'rejected',
          status: approved ? 'active' : 'rejected'
        })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success(`Campaign ${approved ? 'approved' : 'rejected'} successfully`);
      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yeild-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campaign Approvals</h2>
        <Badge variant="outline" className="text-yeild-yellow border-yeild-yellow">
          {campaigns.filter(c => c.admin_approval_status === 'pending').length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{campaign.title}</CardTitle>
                  <p className="text-gray-400">
                    by {campaign.brand_profiles?.company_name || 'Unknown Brand'}
                  </p>
                </div>
                <Badge className={`${getStatusColor(campaign.admin_approval_status)} text-white`}>
                  {getStatusIcon(campaign.admin_approval_status)}
                  <span className="ml-1 capitalize">{campaign.admin_approval_status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{campaign.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-white font-semibold">₦{campaign.budget.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-white">{new Date(campaign.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yeild-yellow" />
                  <div>
                    <p className="text-sm text-gray-400">Industry</p>
                    <p className="text-white">{campaign.brand_profiles?.industry || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Created: {new Date(campaign.created_at).toLocaleDateString()}
              </div>

              {campaign.admin_approval_status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApproval(campaign.id, true)}
                    disabled={processingId === campaign.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Campaign
                  </Button>
                  <Button
                    onClick={() => handleApproval(campaign.id, false)}
                    disabled={processingId === campaign.id}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No campaigns found</p>
        </div>
      )}
    </div>
  );
};
