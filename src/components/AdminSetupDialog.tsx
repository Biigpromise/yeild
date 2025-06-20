
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminSetupService } from '@/services/admin/adminSetupService';
import { useNavigate } from 'react-router-dom';

interface AdminSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminSetupDialog: React.FC<AdminSetupDialogProps> = ({ open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGrantAccess = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await adminSetupService.makeCurrentUserAdmin();
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          navigate('/admin');
        }, 2000);
      } else {
        setError('Failed to grant admin access. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSuccess(false);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Admin Setup
          </DialogTitle>
          <DialogDescription>
            Grant yourself administrator privileges to access the admin panel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {success ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-green-800 font-medium">Success!</p>
                <p className="text-green-700 text-sm">Admin access granted. Redirecting to admin panel...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This will give you full administrative privileges including:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• User management and role assignment</li>
                <li>• Task creation and management</li>
                <li>• Financial operations and withdrawals</li>
                <li>• System configuration and settings</li>
              </ul>
              <p className="text-sm text-amber-600">
                ⚠️ Only grant admin access if you are authorized to manage this platform.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            {!success && (
              <Button 
                onClick={handleGrantAccess}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant Admin Access
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
