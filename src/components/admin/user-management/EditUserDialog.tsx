
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  email: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  user_roles: Array<{ role: string }>;
}

interface EditUserDialogProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    points: 0,
    level: 1,
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        points: user.points || 0,
        level: user.level || 1,
        role: user.user_roles[0]?.role || 'user'
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          points: formData.points,
          level: formData.level,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      const currentRole = user.user_roles[0]?.role || 'user';
      if (formData.role !== currentRole) {
        // Remove old role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id);

        // Add new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: formData.role });

        if (roleError) throw roleError;
      }

      toast.success('User updated successfully');
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter user name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
