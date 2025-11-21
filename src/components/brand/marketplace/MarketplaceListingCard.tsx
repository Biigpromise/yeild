import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceListing } from "@/services/marketplaceService";
import { Eye, MousePointerClick, Calendar, ExternalLink, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  onRemove?: (id: string) => void;
  onExtend?: (id: string) => void;
}

export function MarketplaceListingCard({ listing, onRemove, onExtend }: MarketplaceListingCardProps) {
  const daysRemaining = Math.ceil(
    (new Date(listing.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    switch (listing.status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'removed':
        return <Badge variant="destructive">Removed</Badge>;
      case 'pending_approval':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  const ctr = listing.views_count > 0 
    ? ((listing.clicks_count / listing.views_count) * 100).toFixed(2)
    : '0.00';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{listing.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{listing.category}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {listing.image_url && (
          <img 
            src={listing.image_url} 
            alt={listing.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {listing.description}
        </p>

        {listing.external_link && (
          <a
            href={listing.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1 mb-4"
          >
            <ExternalLink className="h-3 w-3" />
            View Link
          </a>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              Views
            </div>
            <div className="font-bold">{listing.views_count}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <MousePointerClick className="h-4 w-4" />
              Clicks
            </div>
            <div className="font-bold">{listing.clicks_count}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">CTR</div>
            <div className="font-bold">{ctr}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          {listing.status === 'active' ? (
            daysRemaining > 0 ? (
              <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
            ) : (
              <span className="text-orange-500">Expires today</span>
            )
          ) : (
            <span>Ended {formatDistanceToNow(new Date(listing.end_date), { addSuffix: true })}</span>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          Total paid: ₦{listing.total_paid.toLocaleString()} • {listing.days_paid} days
        </div>

        <div className="flex gap-2">
          {listing.status === 'active' && onExtend && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onExtend(listing.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Extend
            </Button>
          )}
          {listing.status === 'active' && onRemove && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemove(listing.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
