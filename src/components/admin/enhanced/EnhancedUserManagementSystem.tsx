
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  enhancedUserManagementService, 
  UserActivityData, 
  UserSearchFilters,
  SuspensionAction 
} from "@/services/admin/enhancedUserManagementService";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  Ban, 
  CheckCircle, 
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  UserX,
  UserCheck,
  Calendar,
  Clock
} from "lucide-react";

export const EnhancedUserManagementSystem = () => {
  const [users, setUsers] = useState<UserActivityData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserSearchFilters>({
    searchTerm: "",
    status: "all",
    sortBy: "joinDate",
    sortOrder: "desc"
  });

  // Suspension/Ban dialogs
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

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await enhancedUserManagementService.searchUsers(filters);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'suspended':
        return <Clock className="h-3 w-3" />;
      case 'banned':
        return <Ban className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced User Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                value={filters.searchTerm || ""}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={filters.status || "all"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
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

            <Select 
              value={filters.sortBy || "joinDate"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="tasks">Tasks</SelectItem>
                <SelectItem value="joinDate">Join Date</SelectItem>
                <SelectItem value="lastActive">Last Active</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.sortOrder || "desc"} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadUsers} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bulk Operations</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBulkDialog({ open: true, operation: 'suspend' })}
                disabled={selectedUsers.length === 0}
              >
                Suspend Selected ({selectedUsers.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBulkDialog({ open: true, operation: 'activate' })}
                disabled={selectedUsers.length === 0}
              >
                Activate Selected ({selectedUsers.length})
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setBulkDialog({ open: true, operation: 'ban' })}
                disabled={selectedUsers.length === 0}
              >
                Ban Selected ({selectedUsers.length})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(u => u.userId));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === users.length && users.length > 0}
                    />
                  </TableHead>
                  <TableHead>User Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Points & Tasks</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={selectedUsers.includes(user.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.userId]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.userId));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.userName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(user.accountStatus)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(user.accountStatus)}
                        {user.accountStatus}
                      </Badge>
                      {user.suspensionReason && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Reason: {user.suspensionReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Logins: {user.totalLogins}</div>
                        <div>Streak: {user.streakDays} days</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.pointsEarned} pts</div>
                        <div>{user.tasksCompleted} tasks</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.accountStatus === 'suspended' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUnsuspendUser(user.userId)}
                            className="text-green-600"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Unsuspend
                          </Button>
                        ) : user.accountStatus === 'banned' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUnsuspendUser(user.userId)}
                            className="text-green-600"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Unban
                          </Button>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSuspensionForm({ userId: user.userId, reason: "", duration: undefined });
                                setSuspensionDialog({ open: true, userId: user.userId });
                              }}
                              className="text-yellow-600"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setBanDialog({ open: true, userId: user.userId })}
                              className="text-red-600"
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Ban
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
