
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { BrandCampaign } from "@/hooks/useBrandCampaigns";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  budget: z.number().min(10, "Minimum budget is $10"),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignSaved: () => void;
  campaign?: BrandCampaign | null;
}

export const CampaignFormDialog: React.FC<CampaignFormDialogProps> = ({
  open,
  onOpenChange,
  onCampaignSaved,
  campaign
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: campaign?.title || "",
      description: campaign?.description || "",
      budget: campaign?.budget || 10,
      status: campaign?.status || 'draft',
      start_date: campaign?.start_date || "",
      end_date: campaign?.end_date || "",
    }
  });

  React.useEffect(() => {
    if (campaign) {
      form.reset({
        title: campaign.title,
        description: campaign.description || "",
        budget: campaign.budget,
        status: campaign.status,
        start_date: campaign.start_date || "",
        end_date: campaign.end_date || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        budget: 10,
        status: 'draft',
        start_date: "",
        end_date: "",
      });
    }
  }, [campaign, form]);

  const onSubmit = async (data: CampaignFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const campaignData = {
        brand_id: user.id,
        title: data.title,
        description: data.description,
        budget: data.budget,
        status: data.status,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      if (campaign) {
        const { error } = await supabase
          .from('brand_campaigns')
          .update(campaignData)
          .eq('id', campaign.id);
        
        if (error) throw error;
        toast.success('Campaign updated successfully!');
      } else {
        const { error } = await supabase
          .from('brand_campaigns')
          .insert([campaignData]);
        
        if (error) throw error;
        toast.success('Campaign created successfully!');
      }

      onCampaignSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Enter campaign title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe your campaign objectives"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              min="10"
              step="0.01"
              {...form.register('budget', { valueAsNumber: true })}
              placeholder="10.00"
            />
            {form.formState.errors.budget && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.budget.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => form.setValue('status', value as any)} defaultValue={form.getValues('status')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...form.register('start_date')}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...form.register('end_date')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
