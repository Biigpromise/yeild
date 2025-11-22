import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { marketplaceService, MarketplaceListing } from "@/services/marketplaceService";
import { ImageGalleryUpload } from "./ImageGalleryUpload";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  image_urls: z.array(z.string()).max(5, "Maximum 5 images allowed").optional(),
  external_link: z.string().url("Please enter a valid URL").optional().or(z.literal(""))
});

interface EditMarketplaceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: MarketplaceListing;
}

export function EditMarketplaceListingDialog({ open, onOpenChange, listing }: EditMarketplaceListingDialogProps) {
  const queryClient = useQueryClient();
  
  // Parse image_urls from Json type to string[]
  const parseImageUrls = (): string[] => {
    if (listing.image_urls && Array.isArray(listing.image_urls)) {
      return listing.image_urls.filter((url): url is string => typeof url === 'string');
    }
    return listing.image_url ? [listing.image_url] : [];
  };
  
  const [images, setImages] = useState<string[]>(parseImageUrls());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      image_urls: images,
      external_link: listing.external_link || ""
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      marketplaceService.updateListing(listing.id, {
        ...data,
        image_url: data.image_urls?.[0] || images[0],
        image_urls: data.image_urls || images
      }),
    onSuccess: () => {
      toast.success("Listing updated successfully");
      queryClient.invalidateQueries({ queryKey: ['brand-marketplace-listings'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update listing");
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateMutation.mutate({ ...data, image_urls: images });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter listing title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your product or service..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Images (Max 5)</FormLabel>
              <ImageGalleryUpload images={images} onChange={setImages} />
            </div>

            <FormField
              control={form.control}
              name="external_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://yourstore.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Read-only fields */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                The following fields cannot be edited:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{listing.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tier</p>
                  <p className="text-sm text-muted-foreground capitalize">{listing.listing_tier || 'standard'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Price per Day</p>
                  <p className="text-sm text-muted-foreground">₦{listing.price_per_day?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Days Paid</p>
                  <p className="text-sm text-muted-foreground">{listing.days_paid} days</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                To extend your listing duration, use the "Extend" button instead.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Updating..." : "Update Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
