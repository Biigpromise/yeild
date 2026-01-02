import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";

interface ExtendListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
}

export function ExtendListingDialog({ open, onOpenChange, listingId }: ExtendListingDialogProps) {
  const [additionalDays, setAdditionalDays] = useState(7);
  const queryClient = useQueryClient();

  const extendMutation = useMutation({
    mutationFn: () => marketplaceService.extendListing(listingId, additionalDays),
    onSuccess: () => {
      toast.success("Listing extended successfully!");
      queryClient.invalidateQueries({ queryKey: ['brand-marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to extend listing");
    }
  });

  const totalCost = additionalDays * 2500;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Listing Duration</DialogTitle>
          <DialogDescription>
            Add more days to keep your listing active longer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Additional Days: {additionalDays}</Label>
            <Slider
              value={[additionalDays]}
              onValueChange={(value) => setAdditionalDays(value[0])}
              min={1}
              max={30}
              step={1}
              className="mt-2"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Price per day:</span>
              <span>₦2,500</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Additional days:</span>
              <span>{additionalDays} {additionalDays === 1 ? 'day' : 'days'}</span>
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => extendMutation.mutate()} disabled={extendMutation.isPending}>
              {extendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Extend (₦{totalCost.toLocaleString()})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
