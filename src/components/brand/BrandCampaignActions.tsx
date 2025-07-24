
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Play, Pause } from 'lucide-react';
import { CampaignDetailsDialog } from './CampaignDetailsDialog';
import { EditCampaignDialog } from './EditCampaignDialog';
import { supabase } from '@/integrations/supabase/client';
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

interface BrandCampaign {
  id: string;
  title: string;
  description: string | null;
  budget: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  admin_approval_status: string;
  target_audience?: any;
  requirements?: any;
  payment_status: string;
  funded_amount: number;
}

interface BrandCampaignActionsProps {
  campaign: BrandCampaign;
  onUpdate: () => void;
}

export const BrandCampaignActions: React.FC<BrandCampaignActionsProps> = ({
  campaign,
  onUpdate
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('Campaign deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('brand_campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      onUpdate();
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    onUpdate();
  };

  const canEdit = campaign.admin_approval_status !== 'approved';
  const canDelete = campaign.status !== 'active';

  // Create a complete campaign object with default values for missing properties
  const completeCampaign: BrandCampaign = {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    budget: campaign.budget,
    status: campaign.status,
    start_date: campaign.start_date,
    end_date: campaign.end_date,
    created_at: campaign.created_at,
    updated_at: campaign.updated_at || campaign.created_at,
    admin_approval_status: campaign.admin_approval_status || 'pending',
    target_audience: campaign.target_audience,
    requirements: campaign.requirements,
    payment_status: campaign.payment_status || 'unpaid',
    funded_amount: campaign.funded_amount || 0
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsDetailsOpen(true)}
      >
        <Eye className="h-4 w-4 mr-1" />
        View Details
      </Button>

      {canEdit && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      {campaign.admin_approval_status === 'approved' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleStatusToggle}
          disabled={isUpdatingStatus}
        >
          {campaign.status === 'active' ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Activate
            </>
          )}
        </Button>
      )}

      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the campaign "{campaign.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <CampaignDetailsDialog
        campaign={completeCampaign}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <EditCampaignDialog
        campaign={completeCampaign}
        isOpen={isEditOpen}
        onClose={handleEditClose}
      />
    </div>
  );
};
