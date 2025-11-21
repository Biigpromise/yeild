import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceListing, marketplaceService } from "@/services/marketplaceService";
import { ExternalLink, Eye, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

interface MarketplaceListingDetailCardProps {
  listing: MarketplaceListing;
}

export function MarketplaceListingDetailCard({ listing }: MarketplaceListingDetailCardProps) {
  const handleViewListing = async () => {
    try {
      await marketplaceService.trackView(listing.id);
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleVisitStore = async () => {
    if (!listing.external_link) {
      toast.error("No link available for this listing");
      return;
    }

    try {
      await marketplaceService.trackClick(listing.id);
      window.open(listing.external_link, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track click:', error);
      window.open(listing.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  // Track view when card is visible
  useEffect(() => {
    handleViewListing();
  }, [listing.id]);

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">
            {listing.category}
          </Badge>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views_count}
            </span>
            <span className="flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" />
              {listing.clicks_count}
            </span>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {listing.image_url && (
          <img 
            src={listing.image_url} 
            alt={listing.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {listing.description}
        </p>

        {listing.external_link && (
          <Button 
            className="w-full"
            onClick={handleVisitStore}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Store
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
