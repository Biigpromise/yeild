import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fileUploadService } from '@/services/fileUploadService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  onProfileUpdate: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose, userProfile, onProfileUpdate }: ProfileEditModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: userProfile?.display_name || userProfile?.name || '',
    bio: userProfile?.bio || '',
    email: user?.email || '',
    profile_picture_url: userProfile?.profile_picture_url || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload to storage
      const uploadResult = await fileUploadService.uploadProfilePicture(file, user.id);
      
      if (uploadResult && uploadResult.url) {
        // Update profile picture URL in database
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            profile_picture_url: uploadResult.url,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error updating profile picture:', error);
          toast.error('Failed to update profile picture');
        } else {
          setFormData(prev => ({ ...prev, profile_picture_url: uploadResult.url }));
          toast.success('Profile picture updated successfully!');
        }
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    setUploadingAvatar(true);
    try {
      // Remove from storage if exists
      if (formData.profile_picture_url) {
        await fileUploadService.deleteProfilePicture(formData.profile_picture_url);
      }

      // Update database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          profile_picture_url: null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error removing profile picture:', error);
        toast.error('Failed to remove profile picture');
      } else {
        setFormData(prev => ({ ...prev, profile_picture_url: '' }));
        toast.success('Profile picture removed successfully!');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: formData.name,
          bio: formData.bio,
          profile_picture_url: formData.profile_picture_url,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully!');
        onProfileUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={formData.profile_picture_url} 
                  alt="Profile picture" 
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <Button
                onClick={handleAvatarUpload}
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2"
                disabled={uploadingAvatar}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleAvatarUpload}
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </Button>
              
              {formData.profile_picture_url && (
                <Button
                  onClick={handleRemoveAvatar}
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your display name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="mt-1 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from here
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-warning hover:bg-warning/90 text-black"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};