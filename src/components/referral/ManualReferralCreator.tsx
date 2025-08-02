import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ManualReferralCreator: React.FC = () => {
  const { user } = useAuth();
  const [referredEmail, setReferredEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const createManualReferral = async () => {
    if (!user?.id || !referredEmail) return;

    setLoading(true);
    try {
      // First, find the referred user by email
      const { data: referredUser, error: userError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('email', referredEmail.trim())
        .single();

      if (userError || !referredUser) {
        toast.error('User with that email not found');
        return;
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('referred_id', referredUser.id)
        .single();

      if (existingReferral) {
        toast.error('Referral already exists for this user');
        return;
      }

      // Get referrer's referral code
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      if (!referrerProfile?.referral_code) {
        toast.error('Your referral code not found');
        return;
      }

      // Create the referral
      const { error: insertError } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: user.id,
          referred_id: referredUser.id,
          referral_code: referrerProfile.referral_code,
          is_active: false // Will be activated when they complete a task
        });

      if (insertError) {
        throw insertError;
      }

      // Update total referrals count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          total_referrals_count: 1 // This will be corrected by the refresh function
        })
        .eq('id', user.id);

      if (updateError) {
        console.warn('Failed to update referral count:', updateError);
      }

      toast.success(`Successfully added referral for ${referredUser.name || referredUser.email}`);
      setReferredEmail('');
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error creating manual referral:', error);
      toast.error('Failed to create referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <UserPlus className="h-5 w-5" />
          Manual Referral Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-sm text-blue-700">
            🧪 <strong>Testing Tool:</strong> Create a referral manually for users already on the platform. 
            Enter the email of an existing user to link them as your referral.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <Input
            placeholder="Enter referred user's email (e.g., jane@example.com)"
            value={referredEmail}
            onChange={(e) => setReferredEmail(e.target.value)}
            type="email"
            className="w-full"
          />
          
          <Button 
            onClick={createManualReferral}
            disabled={loading || !referredEmail.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Referral...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Manual Referral
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-blue-600 space-y-1">
          <p>💡 This tool helps test the referral system by linking existing users.</p>
          <p>⚡ The referral will be activated when the referred user completes their first task.</p>
        </div>
      </CardContent>
    </Card>
  );
};