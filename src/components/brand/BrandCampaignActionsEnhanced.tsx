import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  BarChart3,
  DollarSign,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandCampaign {
  id: string;
  title: string;
  description?: string;
  budget: number;
  funded_amount?: number;
  status: string;
  admin_approval_status?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  brand_id: string;
}

interface BrandCampaignActionsEnhancedProps {
  campaign: BrandCampaign;
  onUpdate: () => void;
  onView?: (campaign: BrandCampaign) => void;
  onEdit?: (campaign: BrandCampaign) => void;
  onAnalytics?: (campaign: BrandCampaign) => void;
}

export const BrandCampaignActionsEnhanced: React.FC<BrandCampaignActionsEnhancedProps> = ({
  campaign,
  onUpdate,
  onView,
  onEdit,
  onAnalytics
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('brand_campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success('Campaign deleted successfully');
      onUpdate();
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setStatusLoading(true);
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('brand_campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    } finally {
      setStatusLoading(false);
    }
  };

  const canEdit = campaign.admin_approval_status !== 'approved';
  const canChangeStatus = campaign.admin_approval_status === 'approved';
  const canDelete = campaign.status !== 'active';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onView?.(campaign)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onAnalytics?.(campaign)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canEdit && (
            <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Campaign
            </DropdownMenuItem>
          )}

          {canChangeStatus && (
            <DropdownMenuItem 
              onClick={handleStatusToggle}
              disabled={statusLoading}
            >
              {campaign.status === 'active' ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Activate Campaign
                </>
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Campaign
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};