import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Loader2 } from 'lucide-react';

interface UserProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UserProfileSetupDialog: React.FC<UserProfileSetupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Display name is required');
      return;
    }

    setLoading(true);

    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name.trim(),
          bio: formData.bio.trim() || null,
          email: user.email,
        });

      if (profileError) throw profileError;

      // Add user role
      await supabase.rpc('add_user_role_if_not_exists', {
        p_user_id: user.id,
        p_role: 'user'
      });

      // Create yield wallet if not exists
      const { error: walletError } = await supabase
        .from('yield_wallets')
        .insert({
          user_id: user.id,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        });

      if (walletError && !walletError.message.includes('duplicate')) {
        console.error('Wallet creation error:', walletError);
      }

      toast.success('User profile created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      toast.error(error.message || 'Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Set Up User Profile</DialogTitle>
              <DialogDescription>
                Create your user profile to earn from tasks
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your display name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
