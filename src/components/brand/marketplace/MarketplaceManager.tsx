import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Store } from "lucide-react";
import { CreateMarketplaceListingDialog } from "./CreateMarketplaceListingDialog";
import { EditMarketplaceListingDialog } from "./EditMarketplaceListingDialog";
import { MarketplaceListingCard } from "./MarketplaceListingCard";
import { ExtendListingDialog } from "./ExtendListingDialog";
import { marketplaceService, MarketplaceListing } from "@/services/marketplaceService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MarketplaceManager() {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [listingToRemove, setListingToRemove] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['brand-marketplace-listings', user?.id],
    queryFn: () => marketplaceService.getBrandListings(user!.id),
    enabled: !!user?.id
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => marketplaceService.removeListing(id),
    onSuccess: () => {
      toast.success("Listing removed successfully");
      queryClient.invalidateQueries({ queryKey: ['brand-marketplace-listings'] });
      setRemoveDialogOpen(false);
      setListingToRemove(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove listing");
    }
  });

  const handleRemove = (id: string) => {
    setListingToRemove(id);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (listingToRemove) {
      removeMutation.mutate(listingToRemove);
    }
  };

  const handleEdit = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setEditDialogOpen(true);
  };

  const handleExtend = (id: string) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setSelectedListing(listing);
      setExtendDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6" />
            Marketplace Listings
          </h2>
          <p className="text-muted-foreground mt-1">
            Advertise your products and services to all Yield users
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first marketplace listing to reach thousands of users
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <MarketplaceListingCard
              key={listing.id}
              listing={listing}
              onRemove={handleRemove}
              onExtend={handleExtend}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <CreateMarketplaceListingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedListing && (
        <>
          <EditMarketplaceListingDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            listing={selectedListing}
          />
          <ExtendListingDialog
            open={extendDialogOpen}
            onOpenChange={setExtendDialogOpen}
            listingId={selectedListing.id}
          />
        </>
      )}

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately remove your listing from the marketplace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
