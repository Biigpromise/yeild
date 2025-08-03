import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, User, Hash, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface SearchFilters {
  query: string;
  sender?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasMedia?: boolean;
  hasReactions?: boolean;
  messageType?: 'text' | 'voice' | 'image' | 'all';
}

interface AdvancedSearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  onSearch,
  onClose,
  isOpen
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    messageType: 'all'
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters(prev => ({ ...prev, [key]: undefined }));
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== 'all'
  ).length;

  if (!isOpen) return null;

  return (
    <Card className="border-border bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search messages..."
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Quick filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Type</label>
            <Select 
              value={filters.messageType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, messageType: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="text">Text Only</SelectItem>
                <SelectItem value="voice">Voice Messages</SelectItem>
                <SelectItem value="image">Images</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sender</label>
            <Input
              placeholder="Filter by sender..."
              value={filters.sender || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
            />
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <DatePicker
              date={filters.dateFrom}
              onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <DatePicker
              date={filters.dateTo}
              onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
            />
          </div>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters</label>
            <div className="flex flex-wrap gap-2">
              {filters.sender && (
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  {filters.sender}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('sender')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.dateFrom && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  From: {filters.dateFrom.toLocaleDateString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('dateFrom')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  To: {filters.dateTo.toLocaleDateString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => clearFilter('dateTo')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Search actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ query: '', messageType: 'all' })}
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};