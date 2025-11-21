import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { marketplaceService, CreateListingData } from "@/services/marketplaceService";

interface CreateMarketplaceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMarketplaceListingDialog({ open, onOpenChange }: CreateMarketplaceListingDialogProps) {
  const [days, setDays] = useState(7);
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateListingData>({
    defaultValues: {
      days_paid: 7
    }
  });

  const category = watch("category");

  const { data: categories = [] } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: () => marketplaceService.getCategories()
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateListingData) => marketplaceService.createListing(data),
    onSuccess: () => {
      toast.success("Marketplace listing created successfully!");
      queryClient.invalidateQueries({ queryKey: ['brand-marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create listing");
    }
  });

  const onSubmit = (data: CreateListingData) => {
    if (!data.category) {
      toast.error("Please select a category");
      return;
    }
    createMutation.mutate({ ...data, days_paid: days });
  };

  const totalCost = days * 10000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Marketplace Listing</DialogTitle>
          <DialogDescription>
            Advertise your products or services to all Yield users. Pay ₦10,000 per day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Listing Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Summer Fashion Sale - 50% Off"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description", { required: "Description is required" })}
              placeholder="Describe your product, service, or promotion..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image_url">Image URL (optional)</Label>
            <Input
              id="image_url"
              {...register("image_url")}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="external_link">External Link (optional)</Label>
            <Input
              id="external_link"
              {...register("external_link")}
              placeholder="https://your-store.com"
            />
          </div>

          <div>
            <Label>Duration: {days} {days === 1 ? 'day' : 'days'}</Label>
            <Slider
              value={[days]}
              onValueChange={(value) => setDays(value[0])}
              min={1}
              max={30}
              step={1}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Select how many days you want your listing to be active
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price per day:</span>
              <span>₦10,000</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Duration:</span>
              <span>{days} {days === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Cost:</span>
                <span className="font-bold text-lg text-primary">
                  ₦{totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Listing (₦{totalCost.toLocaleString()})
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
