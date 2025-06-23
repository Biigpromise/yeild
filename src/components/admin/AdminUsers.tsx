
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { realAdminUserService } from "@/services/admin/realAdminUserService";
import { roleService } from "@/services/roleService";
import { LoadingState } from "@/components/ui/loading-state";
import { UserSearchAutocomplete } from "@/components/admin/UserSearchAutocomplete";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  tasks_completed: number;
  created_at: string;
  user_roles?: Array<{ role: string }>;
  user_streaks?: Array<{ current_streak: number }>;
};

export const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await realAdminUserService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      console.log('Changing role for user:', userId, 'to:', newRole);
      
      // Use the roleService to assign the new role
      const success = await roleService.assignRole(userId, newRole);
      
      if (success) {
        toast.success(`User role updated to ${newRole}`);
        // Reload users to reflect the change
        await loadUsers();
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSuspendUsers = async () => {
    for (const userId of selectedUsers) {
      await realAdminUserService.updateUserStatus(userId, 'suspended');
    }
    setSelectedUsers([]);
    loadUsers();
  };

  const getUserLevel = (points: number) => {
    if (points >= 10000) return "Gold";
    if (points >= 5000) return "Silver";
    return "Bronze";
  };

  const getUserStreak = (user: User) => {
    return user.user_streaks?.[0]?.current_streak || 0;
  };

  const getUserRole = (user: User) => {
    return user.user_roles?.[0]?.role || 'user';
  };

  if (loading) {
    return <LoadingState text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <UserSearchAutocomplete
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by name or email"
              className="max-w-sm"
            />
            <Button 
              variant="destructive" 
              disabled={selectedUsers.length === 0}
              onClick={handleSuspendUsers}
            >
              Suspend Selected
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4" 
                      onChange={() => {
                        if (selectedUsers.length === filteredUsers.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        }
                      }}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name || 'Unknown'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.points || 0}</TableCell>
                    <TableCell>{getUserStreak(user)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getUserLevel(user.points || 0) === "Gold" ? "bg-yellow-100 text-yellow-800" :
                        getUserLevel(user.points || 0) === "Silver" ? "bg-gray-100 text-gray-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {getUserLevel(user.points || 0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={getUserRole(user)} 
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          Suspend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
