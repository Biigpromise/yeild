
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';
import { adminSetupService } from '@/services/admin/adminSetupService';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

export const AdminAccessBanner: React.FC = () => {
  const { user } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    const hasAccess = await adminSetupService.checkAdminAccess();
    setHasAdminAccess(hasAccess);
  };

  if (!user || hasAdminAccess || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          You don't have admin access yet. Set up admin privileges to access the admin dashboard.
        </span>
        <div className="flex items-center gap-2 ml-4">
          <Button asChild size="sm" variant="outline">
            <Link to="/admin-setup">Setup Admin</Link>
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
