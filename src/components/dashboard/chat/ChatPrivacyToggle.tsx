
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeOff, Eye, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ChatPrivacyToggle: React.FC = () => {
  const { user } = useAuth();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySetting();
    }
  }, [user]);

  const loadPrivacySetting = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_anonymous')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading privacy setting:', error);
        return;
      }

      setIsAnonymous(data?.is_anonymous || false);
    } catch (error) {
      console.error('Error in loadPrivacySetting:', error);
    }
  };

  const updatePrivacySetting = async (anonymous: boolean) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_anonymous: anonymous })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating privacy setting:', error);
        toast.error('Failed to update privacy setting');
        return;
      }

      setIsAnonymous(anonymous);
      toast.success(anonymous ? 'You are now chatting anonymously' : 'You are now showing your username');
    } catch (error) {
      console.error('Error in updatePrivacySetting:', error);
      toast.error('Failed to update privacy setting');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <CardTitle className="text-sm">Chat Privacy</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {isAnonymous 
            ? "You're chatting as Anonymous. Other users can't see your username."
            : "You're chatting with your username visible to other users."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <Switch
            id="anonymous-mode"
            checked={isAnonymous}
            onCheckedChange={updatePrivacySetting}
            disabled={loading}
          />
          <Label htmlFor="anonymous-mode" className="text-sm">
            Chat anonymously
          </Label>
        </div>
        <div className="flex items-start gap-2 mt-3 p-2 bg-muted rounded-md">
          <Info className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Admins and moderators may still be able to see your username for moderation purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
