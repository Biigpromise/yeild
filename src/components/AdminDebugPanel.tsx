import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useRole } from '@/hooks/useRole';
import { adminSetupService } from '@/services/admin/adminSetupService';
import { RefreshCw, Shield, User } from 'lucide-react';

export const AdminDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { userRole, loading: userRoleLoading } = useUserRole();
  const { role, hasRequiredRole, loading: roleLoading, isAdmin } = useRole('admin');
  const [refreshing, setRefreshing] = useState(false);
  const [adminAccess, setAdminAccess] = useState<boolean | null>(null);

  const handleRefreshAuth = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const handleCheckAdminAccess = async () => {
    try {
      const hasAccess = await adminSetupService.checkAdminAccess();
      setAdminAccess(hasAccess);
      console.log('Admin access check result:', hasAccess);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setAdminAccess(false);
    }
  };

  const handleMakeAdmin = async () => {
    try {
      const success = await adminSetupService.makeCurrentUserAdmin();
      if (success) {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Shield className="h-5 w-5" />
          Admin Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User Email:</strong> {user.email}
          </div>
          <div>
            <strong>User ID:</strong> {user.id}
          </div>
          <div>
            <strong>useUserRole Result:</strong> 
            {userRoleLoading ? 'Loading...' : userRole || 'None'}
          </div>
          <div>
            <strong>useRole Result:</strong> 
            {roleLoading ? 'Loading...' : role || 'None'}
          </div>
          <div>
            <strong>Has Admin Role:</strong> 
            {roleLoading ? 'Loading...' : hasRequiredRole ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Is Admin (computed):</strong> 
            {roleLoading ? 'Loading...' : isAdmin ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Admin Service Check:</strong> 
            {adminAccess === null ? 'Not checked' : adminAccess ? 'Yes' : 'No'}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleRefreshAuth}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Page
          </Button>
          
          <Button
            onClick={handleCheckAdminAccess}
            variant="outline"
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Check Admin Access
          </Button>
          
          <Button
            onClick={handleMakeAdmin}
            variant="outline"
            size="sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            Make Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};