
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminUserManagementService, UserActivity } from "@/services/admin/adminUserManagementService";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  Ban, 
  CheckCircle, 
  Activity,
  Crown,
  User,
  Search
} from "lucide-react";

export const EnhancedUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [activityData] = await Promise.all([
        adminUserManagementService.getUserActivity('week')
      ]);
      
      setUserActivity(activityData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAssignment = async (userId: string, newRole: string, currentRole: string) => {
    try {
      await adminUserManagementService.assignUserRole({
        userId,
        currentRole,
        newRole,
        reason: "Admin assignment"
      });
      loadData();
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleAccountStatusUpdate = async (userId: string, status: 'active' | 'suspended' | 'inactive', reason?: string) => {
    try {
      await adminUserManagementService.updateAccountStatus(userId, status, reason);
      loadData();
    } catch (error) {
      console.error("Error updating account status:", error);
    }
  };

  const handleBulkOperation = async (operation: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    try {
      await adminUserManagementService.performBulkUserOperation(selectedUsers, operation);
      setSelectedUsers([]);
      loadData();
    } catch (error) {
      console.error("Error with bulk operation:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'moderator':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userActivity.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {userActivity.filter(u => u.accountStatus === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Ban className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">
                  {userActivity.filter(u => u.accountStatus === 'suspended').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {userActivity.reduce((sum, u) => sum + u.tasksCompleted, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="activity">Activity Monitor</TabsTrigger>
          <TabsTrigger value="roles">Role Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkOperation('suspend')}
                    disabled={selectedUsers.length === 0}
                  >
                    Suspend Selected ({selectedUsers.length})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleBulkOperation('activate')}
                    disabled={selectedUsers.length === 0}
                  >
                    Activate Selected ({selectedUsers.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
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
                              setSelectedUsers(userActivity.map(u => u.userId));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Points Earned</TableHead>
                      <TableHead>Streak</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivity.map((user) => (
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
                          <div className="font-medium">{user.userName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.accountStatus)}>
                            {user.accountStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.tasksCompleted}</TableCell>
                        <TableCell>{user.pointsEarned} pts</TableCell>
                        <TableCell>{user.streakDays} days</TableCell>
                        <TableCell>
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAccountStatusUpdate(
                                user.userId, 
                                user.accountStatus === 'suspended' ? 'active' : 'suspended'
                              )}
                            >
                              {user.accountStatus === 'suspended' ? 'Activate' : 'Suspend'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Monitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Real-time activity monitoring dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Assignment Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced role management interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
