import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Trash2, Eye, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const BrandCampaignsManager = () => {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin-brand-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles!inner(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateCampaignStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('brand_campaigns')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brand-campaigns'] });
      toast.success('Campaign status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update campaign status');
      console.error('Error updating campaign:', error);
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brand_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brand-campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete campaign');
      console.error('Error deleting campaign:', error);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {campaigns?.map((campaign) => (
          <Card key={campaign.id}>
            <CardContent className="p-6 pb-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{campaign.title}</h3>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Brand: {campaign.brand_profiles?.company_name}
              </p>
              <p className="text-sm text-foreground line-clamp-2">
                {campaign.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>Budget: ₦{Number(campaign.budget).toLocaleString()}</span>
                <span>Funded: ₦{Number(campaign.funded_amount || 0).toLocaleString()}</span>
                {campaign.start_date && (
                  <span>Start: {new Date(campaign.start_date).toLocaleDateString()}</span>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex items-center justify-between gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCampaign(campaign)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View Details</span>
              </Button>
              
              <div className="flex items-center gap-2">
                {campaign.status === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCampaignStatus.mutate({ 
                      id: campaign.id, 
                      status: 'paused' 
                    })}
                  >
                    <Pause className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Pause</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCampaignStatus.mutate({ 
                      id: campaign.id, 
                      status: 'active' 
                    })}
                  >
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Resume</span>
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="hidden sm:inline ml-2">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{campaign.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteCampaign.mutate(campaign.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedCampaign.title}</h3>
                <p className="text-sm text-gray-600">
                  Brand: {selectedCampaign.brand_profiles?.company_name}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm">{selectedCampaign.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Budget</h4>
                  <p>₦{Number(selectedCampaign.budget).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
              </div>
              
              {selectedCampaign.requirements && (
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <pre className="text-sm bg-gray-50 p-2 rounded">
                    {JSON.stringify(selectedCampaign.requirements, null, 2)}
                  </pre>
                </div>
              )}
              
              <Button onClick={() => setSelectedCampaign(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};