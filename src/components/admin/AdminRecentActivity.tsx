
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AdminUser } from "@/services/adminService";

export const AdminRecentActivity = () => {
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      setLoading(true);
      
      // Get recent users (last 10)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get user roles for these users
      const userIds = profiles?.map(p => p.id) || [];
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      // Group roles by user_id
      const userRolesMap: Record<string, Array<{ role: string }>> = {};
      if (userRoles) {
        userRoles.forEach(roleRecord => {
          if (!userRolesMap[roleRecord.user_id]) {
            userRolesMap[roleRecord.user_id] = [];
          }
          userRolesMap[roleRecord.user_id].push({ role: roleRecord.role });
        });
      }

      // Combine profiles with roles
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        user_roles: userRolesMap[profile.id] || [{ role: 'user' }]
      }));

      setRecentUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    // Simple logic - users with tasks completed are active
    if (user.tasks_completed > 0) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800">New</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent User Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" onClick={loadRecentActivity}>
            View All Users
          </Button>
        </div>
        
        <div className="border rounded-md">
          <div className="grid grid-cols-3 p-3 border-b bg-muted/50">
            <div className="font-medium">User</div>
            <div className="font-medium">Email</div>
            <div className="font-medium">Status</div>
          </div>
          
          {recentUsers.length > 0 ? (
            <div className="divide-y">
              {recentUsers.map((user) => (
                <div key={user.id} className="grid grid-cols-3 p-3">
                  <div>
                    <div className="font-medium">{user.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">{user.email}</div>
                  <div>{getStatusBadge(user)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No user activity yet</p>
              <p className="text-sm">User activity will appear here once users start joining</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
