import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, Shield, User, Search, Plus, Edit } from "lucide-react";

interface UserRole {
  id: string;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
  last_login_at?: string;
}

interface RoleChangeDialog {
  open: boolean;
  userId: string;
  userName: string;
  currentRoles: string[];
  newRole: string;
  reason: string;
}

export const RoleAssignmentInterface: React.FC = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleDialog, setRoleDialog] = useState<RoleChangeDialog>({
    open: false,
    userId: "",
    userName: "",
    currentRoles: [],
    newRole: "",
    reason: ""
  });

  useEffect(() => {
    loadUsersWithRoles();
  }, []);

  const loadUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Get users with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserRole[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.name || 'No name',
        email: profile.email || 'No email',
        roles: userRoles?.filter(role => role.user_id === profile.id).map(r => r.role) || ['user'],
        created_at: profile.created_at,
        last_login_at: profile.last_login_at
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users with roles:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      const { userId, newRole, reason, currentRoles } = roleDialog;
      
      // Remove existing roles (except 'user' which is default)
      for (const role of currentRoles) {
        if (role !== 'user') {
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role);
        }
      }

      // Add new role if it's not 'user'
      if (newRole !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: newRole
          });

        if (error) throw error;
      }

      // Log the role change
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action: 'role_change',
          details: {
            from_roles: currentRoles,
            to_role: newRole,
            reason: reason,
            changed_by: (await supabase.auth.getUser()).data.user?.id
          }
        });

      toast.success('Role updated successfully');
      setRoleDialog({ ...roleDialog, open: false, reason: "" });
      loadUsersWithRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleIcon = (roles: string[]) => {
    if (roles.includes('admin')) return <Crown className="h-4 w-4 text-red-500" />;
    if (roles.includes('moderator')) return <Shield className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getRoleColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'bg-red-100 text-red-800 border-red-200';
    if (roles.includes('moderator')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getHighestRole = (roles: string[]) => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    return 'user';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Distribution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.roles.includes('admin')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.roles.includes('moderator')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => !u.roles.includes('admin') && !u.roles.includes('moderator')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="moderator">Moderators</SelectItem>
            <SelectItem value="user">Regular Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found matching your search criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.roles)}
                          <Badge className={getRoleColor(user.roles)}>
                            {getHighestRole(user.roles)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRoleDialog({
                            open: true,
                            userId: user.id,
                            userName: user.name,
                            currentRoles: user.roles,
                            newRole: getHighestRole(user.roles),
                            reason: ""
                          })}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog({ ...roleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <p className="text-sm text-muted-foreground">{roleDialog.userName}</p>
            </div>
            
            <div>
              <Label>Current Role</Label>
              <p className="text-sm text-muted-foreground">
                {getHighestRole(roleDialog.currentRoles)}
              </p>
            </div>

            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select
                value={roleDialog.newRole}
                onValueChange={(value) => setRoleDialog({ ...roleDialog, newRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason for change</Label>
              <Textarea
                id="reason"
                value={roleDialog.reason}
                onChange={(e) => setRoleDialog({ ...roleDialog, reason: e.target.value })}
                placeholder="Explain why this role change is necessary..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRoleDialog({ ...roleDialog, open: false })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={!roleDialog.reason.trim()}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};