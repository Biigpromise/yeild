import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketplaceListingDetailCard } from "./MarketplaceListingDetailCard";
import { marketplaceService } from "@/services/marketplaceService";
import { Search, Store } from "lucide-react";

export function MarketplaceBrowser() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories = [] } = useQuery({
    queryKey: ['marketplace-categories'],
    queryFn: () => marketplaceService.getCategories()
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace-listings', category, debouncedSearch],
    queryFn: () => marketplaceService.getActiveListings({
      category: category !== 'all' ? category : undefined,
      search: debouncedSearch || undefined
    })
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-1">
          <Store className="h-6 w-6" />
          Marketplace
        </h2>
        <p className="text-muted-foreground">
          Discover products and services from brands on Yield
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground">
            {search || category !== 'all' 
              ? 'Try adjusting your filters or search term'
              : 'Check back later for new listings'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <MarketplaceListingDetailCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
