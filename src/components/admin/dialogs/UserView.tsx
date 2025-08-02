import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Crown, 
  Building, 
  Mail,
  Calendar,
  Award,
  Edit,
  Ban,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface UserViewProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole?: (userId: string, role: string) => void;
  onSuspendUser?: (userId: string) => void;
  onActivateUser?: (userId: string) => void;
}

export const UserView: React.FC<UserViewProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateRole,
  onSuspendUser,
  onActivateUser
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  if (!user) return null;

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

  const handleRoleUpdate = () => {
    if (selectedRole && onUpdateRole) {
      onUpdateRole(user.id, selectedRole);
      setIsEditing(false);
      setSelectedRole('');
      toast.success('User role updated successfully');
    }
  };

  const accountAge = user.created_at ? 
    Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.name || 'Unnamed User'}</h2>
              <p className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user.roles?.map((role: string) => (
                  <Badge key={role} className={getRoleColor(role)}>
                    {getRoleIcon(role)}
                    <span className="ml-1 capitalize">{role}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{user.level || 1}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{user.points?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{user.tasks_completed || 0}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">{accountAge}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Account Information
            </h3>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-muted-foreground font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="font-medium">Account Status</p>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Joined</p>
                  <p className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-muted-foreground">
                    {user.updated_at && user.updated_at !== user.created_at ? 
                      new Date(user.updated_at).toLocaleDateString() : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Management
            </h3>
            
            {isEditing ? (
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <Label htmlFor="roleSelect">Assign New Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRoleUpdate} disabled={!selectedRole}>
                    Update Role
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setSelectedRole('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Roles</p>
                    <div className="flex gap-2 mt-1">
                      {user.roles?.length > 0 ? (
                        user.roles.map((role: string) => (
                          <Badge key={role} className={getRoleColor(role)}>
                            {getRoleIcon(role)}
                            <span className="ml-1 capitalize">{role}</span>
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">No roles assigned</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Roles
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end flex-wrap">
            {onSuspendUser && (
              <Button 
                variant="outline" 
                onClick={() => onSuspendUser(user.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </Button>
            )}
            
            {onActivateUser && (
              <Button 
                variant="outline" 
                onClick={() => onActivateUser(user.id)}
                className="text-green-600 hover:text-green-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate User
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};