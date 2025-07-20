import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserX, Shield, Crown, Eye, Ban, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  created_at: string;
  last_login_at?: string;
  points: number;
  tasks_completed: number;
  followers_count: number;
  following_count: number;
  active_referrals_count: number;
  roles: string[];
  is_banned?: boolean;
}

export const AdvancedUserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, sortBy]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get users with their roles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          name,
          profile_picture_url,
          created_at,
          last_login_at,
          points,
          tasks_completed,
          followers_count,
          following_count,
          active_referrals_count
        `)
        .order(sortBy, { ascending: false })
        .limit(100);

      if (usersError) throw usersError;

      // Get user roles
      const userIds = usersData?.map(u => u.id) || [];
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Combine users with their roles
      const usersWithRoles = usersData?.map(user => ({
        ...user,
        roles: rolesData?.filter(r => r.user_id === user.id).map(r => r.role) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
      } else {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
      }

      fetchUsers();
      toast.success(`Role ${action === 'add' ? 'added' : 'removed'} successfully`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const banUser = async (userId: string) => {
    try {
      // Add fraud flag
      await supabase
        .from('fraud_flags')
        .insert({
          flag_type: 'banned_user',
          user_id: userId,
          flag_reason: 'User banned by admin',
          severity: 'high'
        });

      toast.success('User banned successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && user.roles.includes('admin')) ||
      (roleFilter === 'brand' && user.roles.includes('brand')) ||
      (roleFilter === 'user' && user.roles.includes('user'));

    return matchesSearch && matchesRole;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Advanced User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="brand">Brand</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Join Date</SelectItem>
              <SelectItem value="last_login_at">Last Login</SelectItem>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="tasks_completed">Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{user.name || 'Anonymous'}</span>
                        {user.roles.map(role => (
                          <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                      
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{user.points} points</span>
                        <span>{user.tasks_completed} tasks</span>
                        <span>{user.followers_count} followers</span>
                        <span>{user.active_referrals_count} referrals</span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!user.roles.includes('admin') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserRole(user.id, 'admin', 'add')}
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Make Admin
                      </Button>
                    )}
                    
                    {user.roles.includes('admin') && user.roles.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserRole(user.id, 'admin', 'remove')}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remove Admin
                      </Button>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => banUser(user.id)}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Ban
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};