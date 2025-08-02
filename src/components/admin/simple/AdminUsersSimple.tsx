import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { User, Crown, Building, Eye } from 'lucide-react';

export const AdminUsersSimple = () => {
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users-simple'],
    queryFn: async () => {
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin_secure');
      if (!isAdmin) throw new Error('Admin access required');

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          points,
          level,
          tasks_completed,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const userIds = profilesData?.map(p => p.id) || [];
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      return profilesData?.map(profile => ({
        ...profile,
        roles: rolesData?.filter(r => r.user_id === profile.id).map(r => r.role) || []
      })) || [];
    },
    refetchInterval: 30000
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'brand': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'brand': return <Building className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  if (isLoading) return <LoadingState text="Loading users..." />;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage platform users and their roles</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {!users || users.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {user.name || 'Unnamed User'}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge key={role} className={getRoleColor(role)}>
                          {getRoleIcon(role)}
                          <span className="ml-1 capitalize">{role}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="font-medium">Level</p>
                      <p className="text-muted-foreground">Level {user.level || 1}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Points</p>
                      <p className="text-muted-foreground">{user.points?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tasks Completed</p>
                      <p className="text-muted-foreground">{user.tasks_completed || 0}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                      {user.updated_at && user.updated_at !== user.created_at && (
                        <span> • Last updated: {new Date(user.updated_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};