
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Trash2, Upload } from 'lucide-react';
import { fileUploadService } from '@/services/fileUploadService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePictureUploadProps {
  userProfile: any;
  onProfileUpdate: () => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userProfile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await fileUploadService.uploadProfilePicture(file, user.id);
      
      if (result) {
        // Update the profile in the database
        const { error } = await supabase
          .from('profiles')
          .update({
            profile_picture_url: result.url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating profile picture:', error);
          toast.error('Failed to update profile picture');
        } else {
          toast.success('Profile picture updated successfully!');
          onProfileUpdate();
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !userProfile?.profile_picture_url) return;

    try {
      // Extract file path from URL
      const url = new URL(userProfile.profile_picture_url);
      const filePath = url.pathname.split('/').slice(-2).join('/');
      
      // Delete from storage
      const success = await fileUploadService.deleteProfilePicture(filePath);
      
      if (success) {
        // Update the profile in the database
        const { error } = await supabase
          .from('profiles')
          .update({
            profile_picture_url: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Error removing profile picture:', error);
          toast.error('Failed to remove profile picture');
        } else {
          toast.success('Profile picture removed successfully!');
          onProfileUpdate();
        }
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-600">
              <AvatarImage 
                src={userProfile?.profile_picture_url} 
                alt={userProfile?.name || 'Profile'} 
              />
              <AvatarFallback className="text-3xl bg-gray-700 text-white">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>

            {userProfile?.profile_picture_url && (
              <Button
                onClick={handleRemoveAvatar}
                variant="destructive"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-400 text-center">
            Upload a profile picture (JPG, PNG, WebP, or GIF). Max size: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
