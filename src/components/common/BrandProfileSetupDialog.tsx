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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';

interface BrandProfileSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const industries = [
  'Technology',
  'E-commerce',
  'Finance',
  'Healthcare',
  'Education',
  'Entertainment',
  'Food & Beverage',
  'Fashion',
  'Travel',
  'Real Estate',
  'Other',
];

export const BrandProfileSetupDialog: React.FC<BrandProfileSetupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setLoading(true);

    try {
      // Create brand profile
      const { error: profileError } = await supabase
        .from('brand_profiles')
        .insert({
          user_id: user.id,
          company_name: formData.companyName.trim(),
          website: formData.website.trim() || null,
          industry: formData.industry || null,
          description: formData.description.trim() || null,
        });

      if (profileError) throw profileError;

      // Add brand role
      await supabase.rpc('add_user_role_if_not_exists', {
        p_user_id: user.id,
        p_role: 'brand'
      });

      // Create brand wallet
      const { error: walletError } = await supabase
        .from('brand_wallets')
        .insert({
          brand_id: user.id,
          balance: 0,
          total_deposited: 0,
          total_spent: 0,
        });

      if (walletError && !walletError.message.includes('duplicate')) {
        console.error('Wallet creation error:', walletError);
      }

      toast.success('Brand profile created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating brand profile:', error);
      toast.error(error.message || 'Failed to create brand profile');
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
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Set Up Brand Profile</DialogTitle>
              <DialogDescription>
                Create your brand profile to run campaigns
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Your company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourcompany.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about your company..."
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
              Create Brand Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
