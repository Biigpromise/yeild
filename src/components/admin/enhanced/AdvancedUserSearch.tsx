
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserSearchFilters } from "@/services/admin/enhancedUserManagementService";
import { Search, Filter, Calendar as CalendarIcon, X, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";

interface AdvancedUserSearchProps {
  filters: UserSearchFilters;
  onFiltersChange: (filters: UserSearchFilters) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onClearFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<'from' | 'to' | null>(null);

  const updateFilter = (key: keyof UserSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const updateDateRange = (type: 'from' | 'to', date: Date | undefined) => {
    const newDateRange = { ...filters.dateRange };
    if (type === 'from') {
      newDateRange.from = date;
    } else {
      newDateRange.to = date;
    }
    updateFilter('dateRange', newDateRange);
  };

  const updatePointsRange = (type: 'min' | 'max', value: string) => {
    const newPointsRange = { ...filters.pointsRange };
    if (type === 'min') {
      newPointsRange.min = value ? parseInt(value) : undefined;
    } else {
      newPointsRange.max = value ? parseInt(value) : undefined;
    }
    updateFilter('pointsRange', newPointsRange);
  };

  const updateTasksRange = (type: 'min' | 'max', value: string) => {
    const newTasksRange = { ...filters.tasksRange };
    if (type === 'min') {
      newTasksRange.min = value ? parseInt(value) : undefined;
    } else {
      newTasksRange.max = value ? parseInt(value) : undefined;
    }
    updateFilter('tasksRange', newTasksRange);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.pointsRange?.min || filters.pointsRange?.max) count++;
    if (filters.tasksRange?.min || filters.tasksRange?.max) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced User Search & Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={filters.searchTerm || ""}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Join Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover 
                  open={datePickerOpen === 'from'} 
                  onOpenChange={(open) => setDatePickerOpen(open ? 'from' : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from ? format(filters.dateRange.from, "MMM dd, yyyy") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.from}
                      onSelect={(date) => {
                        updateDateRange('from', date);
                        setDatePickerOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover 
                  open={datePickerOpen === 'to'} 
                  onOpenChange={(open) => setDatePickerOpen(open ? 'to' : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.to ? format(filters.dateRange.to, "MMM dd, yyyy") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.to}
                      onSelect={(date) => {
                        updateDateRange('to', date);
                        setDatePickerOpen(null);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Points Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Points Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min points"
                  value={filters.pointsRange?.min || ""}
                  onChange={(e) => updatePointsRange('min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max points"
                  value={filters.pointsRange?.max || ""}
                  onChange={(e) => updatePointsRange('max', e.target.value)}
                />
              </div>
            </div>

            {/* Tasks Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tasks Completed Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min tasks"
                  value={filters.tasksRange?.min || ""}
                  onChange={(e) => updateTasksRange('min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max tasks"
                  value={filters.tasksRange?.max || ""}
                  onChange={(e) => updateTasksRange('max', e.target.value)}
                />
              </div>
            </div>

            {/* Sorting Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort By</Label>
                <Select 
                  value={filters.sortBy || "joinDate"} 
                  onValueChange={(value) => updateFilter('sortBy', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="tasks">Tasks Completed</SelectItem>
                    <SelectItem value="joinDate">Join Date</SelectItem>
                    <SelectItem value="lastActive">Last Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Sort Order</Label>
                <Select 
                  value={filters.sortOrder || "desc"} 
                  onValueChange={(value) => updateFilter('sortOrder', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex justify-end">
          <Button onClick={onSearch} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Apply Filters & Search
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Label className="text-sm font-medium self-center">Active Filters:</Label>
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.searchTerm}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('searchTerm', '')}
                />
              </Badge>
            )}
            {filters.status && filters.status !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', 'all')}
                />
              </Badge>
            )}
            {(filters.dateRange?.from || filters.dateRange?.to) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date Range
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('dateRange', {})}
                />
              </Badge>
            )}
            {(filters.pointsRange?.min || filters.pointsRange?.max) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Points Range
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('pointsRange', {})}
                />
              </Badge>
            )}
            {(filters.tasksRange?.min || filters.tasksRange?.max) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tasks Range
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('tasksRange', {})}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
