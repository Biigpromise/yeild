import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { ImageGalleryUpload } from "./ImageGalleryUpload";
import { ListingTierSelector } from "./ListingTierSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  image_urls: z.array(z.string()).min(1, "At least one image is required").max(5, "Maximum 5 images allowed"),
  external_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  days_paid: z.number().min(1, "Minimum 1 day").max(365, "Maximum 365 days"),
  listing_tier: z.enum(['standard', 'featured', 'premium']).default('standard')
});

interface CreateMarketplaceListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRICING = {
  standard: 2500,
  featured: 5000,
  premium: 10000
};

export function CreateMarketplaceListingDialog({ open, onOpenChange }: CreateMarketplaceListingDialogProps) {
  const [images, setImages] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      image_urls: [],
      external_link: "",
      days_paid: 1,
      listing_tier: 'standard'
    }
  });

  // Fetch wallet balance
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['brand-wallet'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('brand_wallets')
        .select('*')
        .eq('brand_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && open
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: () => marketplaceService.getCategories()
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) =>
      marketplaceService.createListing({
        title: data.title,
        description: data.description,
        category: data.category,
        image_urls: images,
        external_link: data.external_link || undefined,
        days_paid: data.days_paid,
        listing_tier: data.listing_tier
      }),
    onSuccess: () => {
      toast.success("Marketplace listing created successfully!");
      queryClient.invalidateQueries({ queryKey: ['brand-marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['brand-wallet'] });
      onOpenChange(false);
      form.reset();
      setImages([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create listing");
    }
  });

  const tier = form.watch("listing_tier");
  const days = form.watch("days_paid");
  const totalCost = PRICING[tier] * days;
  const walletBalance = wallet?.balance || 0;
  const hasInsufficientFunds = walletBalance < totalCost;

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }
    
    if (hasInsufficientFunds) {
      toast.error("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }
    
    createMutation.mutate({ ...data, image_urls: images });
  };

  const handleFundWallet = () => {
    onOpenChange(false);
    navigate('/brand-dashboard/finance');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Marketplace Listing</DialogTitle>
          <DialogDescription>
            Advertise your products or services to all Yield users. Choose your listing tier for maximum visibility.
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Balance Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Wallet Balance:</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : 'text-green-600'}`}>
              ₦{walletLoading ? '...' : walletBalance.toLocaleString()}
            </span>
            {hasInsufficientFunds && (
              <Button size="sm" variant="outline" onClick={handleFundWallet}>
                Fund Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Insufficient Funds Warning */}
        {hasInsufficientFunds && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Insufficient funds:</strong> You need ₦{totalCost.toLocaleString()} but only have ₦{walletBalance.toLocaleString()}. 
              Please fund your wallet with at least ₦{(totalCost - walletBalance).toLocaleString()} more to create this listing.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Listing Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer Fashion Sale - 50% Off" {...field} />
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
                      placeholder="Describe your product, service, or promotion..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Images * (Max 5)</FormLabel>
              <p className="text-sm text-muted-foreground mb-2">
                First image will be the main image shown in listings
              </p>
              <ImageGalleryUpload images={images} onChange={setImages} />
              {images.length === 0 && (
                <p className="text-sm text-destructive mt-2">At least one image is required</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="external_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Link (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://your-store.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="listing_tier"
              render={({ field }) => (
                <FormItem>
                  <ListingTierSelector
                    value={field.value}
                    onChange={field.onChange}
                    daysSelected={days}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration: {field.value} {field.value === 1 ? 'day' : 'days'}</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Select how many days you want your listing to be active
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createMutation.isPending || hasInsufficientFunds}
                className="flex-1"
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {hasInsufficientFunds ? 'Insufficient Funds' : `Create Listing (₦${totalCost.toLocaleString()})`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
