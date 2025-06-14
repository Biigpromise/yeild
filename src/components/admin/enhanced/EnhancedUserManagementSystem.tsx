import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdvancedUserSearch } from "./AdvancedUserSearch";
import { UserSearchResults } from "./UserSearchResults";
import { 
  enhancedUserManagementService, 
  UserActivityData, 
  UserSearchFilters,
  SuspensionAction 
} from "@/services/admin/enhancedUserManagementService";
import { toast } from "sonner";

export const EnhancedUserManagementSystem = () => {
  const [users, setUsers] = useState<UserActivityData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserSearchFilters>({
    searchTerm: "",
    status: "all",
    sortBy: "joinDate",
    sortOrder: "desc"
  });

  // Dialog states
  const [suspensionDialog, setSuspensionDialog] = useState<{ open: boolean; userId?: string }>({ open: false });
  const [banDialog, setBanDialog] = useState<{ open: boolean; userId?: string }>({ open: false });
  const [bulkDialog, setBulkDialog] = useState<{ open: boolean; operation?: string }>({ open: false });

  // Form states
  const [suspensionForm, setSuspensionForm] = useState<SuspensionAction>({
    userId: "",
    reason: "",
    duration: undefined
  });
  const [banReason, setBanReason] = useState("");
  const [bulkReason, setBulkReason] = useState("");

  // Load users when filters change with enhanced activity data
  useEffect(() => {
    if (filters.searchTerm || filters.status !== 'all' || Object.keys(filters.dateRange || {}).length > 0) {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Use the enhanced search with activity data
      const data = await enhancedUserManagementService.searchUsersWithActivity(filters);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadUsers();
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      sortBy: "joinDate",
      sortOrder: "desc"
    });
    setUsers([]);
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(u => u.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'unsuspend') => {
    switch (action) {
      case 'suspend':
        setSuspensionForm({ userId, reason: "", duration: undefined });
        setSuspensionDialog({ open: true, userId });
        break;
      case 'ban':
        setBanDialog({ open: true, userId });
        break;
      case 'unsuspend':
        await handleUnsuspendUser(userId);
        break;
    }
  };

  const handleSuspendUser = async () => {
    if (!suspensionForm.reason.trim()) {
      toast.error("Suspension reason is required");
      return;
    }

    const success = await enhancedUserManagementService.suspendUser(suspensionForm);
    if (success) {
      setSuspensionDialog({ open: false });
      setSuspensionForm({ userId: "", reason: "", duration: undefined });
      loadUsers();
    }
  };

  const handleBanUser = async () => {
    if (!banReason.trim() || !banDialog.userId) {
      toast.error("Ban reason is required");
      return;
    }

    const success = await enhancedUserManagementService.banUser(banDialog.userId, banReason);
    if (success) {
      setBanDialog({ open: false });
      setBanReason("");
      loadUsers();
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    const success = await enhancedUserManagementService.unsuspendUser(userId, "Manual unsuspension by admin");
    if (success) {
      loadUsers();
    }
  };

  const handleBulkOperation = async (operation: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    const success = await enhancedUserManagementService.performBulkOperation({
      userIds: selectedUsers,
      operation: operation as any,
      reason: bulkReason || `Bulk ${operation} by admin`
    });

    if (success) {
      setBulkDialog({ open: false });
      setBulkReason("");
      setSelectedUsers([]);
      loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Advanced Search Component */}
      <AdvancedUserSearch
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                Bulk Operations ({selectedUsers.length} users selected)
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkDialog({ open: true, operation: 'suspend' })}
                >
                  Suspend Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkDialog({ open: true, operation: 'activate' })}
                >
                  Activate Selected
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setBulkDialog({ open: true, operation: 'ban' })}
                >
                  Ban Selected
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Search Results with Activity Monitoring */}
      <UserSearchResults
        users={users}
        selectedUsers={selectedUsers}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onUserAction={handleUserAction}
        loading={loading}
      />

      {/* Suspension Dialog */}
      <Dialog open={suspensionDialog.open} onOpenChange={(open) => setSuspensionDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Suspension Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for suspension..."
                value={suspensionForm.reason}
                onChange={(e) => setSuspensionForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Leave empty for permanent suspension"
                value={suspensionForm.duration || ""}
                onChange={(e) => setSuspensionForm(prev => ({ 
                  ...prev, 
                  duration: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSuspensionDialog({ open: false })}>
                Cancel
              </Button>
              <Button onClick={handleSuspendUser}>
                Suspend User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Ban Reason</Label>
              <Textarea
                id="banReason"
                placeholder="Enter reason for permanent ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBanDialog({ open: false })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleBanUser}>
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Operation Dialog */}
      <Dialog open={bulkDialog.open} onOpenChange={(open) => setBulkDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk {bulkDialog.operation}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You are about to {bulkDialog.operation} {selectedUsers.length} users.</p>
            <div>
              <Label htmlFor="bulkReason">Reason</Label>
              <Textarea
                id="bulkReason"
                placeholder="Enter reason for this action..."
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBulkDialog({ open: false })}>
                Cancel
              </Button>
              <Button 
                variant={bulkDialog.operation === 'ban' ? 'destructive' : 'default'}
                onClick={() => bulkDialog.operation && handleBulkOperation(bulkDialog.operation)}
              >
                Confirm {bulkDialog.operation}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
