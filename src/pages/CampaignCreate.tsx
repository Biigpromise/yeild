import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Image as ImageIcon, DollarSign, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.number().min(10, "Minimum budget is $10"),
  currency: z.enum(['USD', 'NGN']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const CampaignCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [conversionRate] = useState(1500); // USD to NGN rate

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 10,
      currency: 'USD',
      start_date: "",
      end_date: "",
    }
  });

  const watchedCurrency = form.watch('currency');
  const watchedBudget = form.watch('budget');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `campaign-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, logoFile);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: CampaignFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const budgetInUSD = data.currency === 'NGN' ? data.budget / conversionRate : data.budget;

      const campaignData = {
        brand_id: user.id,
        title: data.title,
        description: data.description,
        budget: budgetInUSD,
        logo_url: logoUrl,
        status: 'draft',
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      };

      const { error } = await supabase
        .from('brand_campaigns')
        .insert([campaignData]);
      
      if (error) throw error;
      
      toast.success('Campaign created successfully!');
      navigate('/brand-dashboard');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const convertedAmount = watchedCurrency === 'NGN' 
    ? (watchedBudget * conversionRate) 
    : (watchedBudget / conversionRate);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/brand-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create New Campaign</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Campaign Title *</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Enter a compelling campaign title"
                      className="mt-1"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Campaign Description *</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Describe your campaign objectives, target audience, and what you want to achieve..."
                      rows={4}
                      className="mt-1"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select onValueChange={(value) => form.setValue('currency', value as 'USD' | 'NGN')} defaultValue="USD">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="NGN">NGN (₦)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="budget">Budget ({watchedCurrency}) *</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="budget"
                          type="number"
                          min="10"
                          step="0.01"
                          {...form.register('budget', { valueAsNumber: true })}
                          placeholder={watchedCurrency === 'USD' ? '10.00' : '15000.00'}
                          className="pl-10"
                        />
                      </div>
                      {watchedCurrency && watchedBudget && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ≈ {watchedCurrency === 'USD' ? '₦' : '$'}{convertedAmount.toLocaleString()} {watchedCurrency === 'USD' ? 'NGN' : 'USD'}
                        </p>
                      )}
                      {form.formState.errors.budget && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.budget.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        {...form.register('start_date')}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        {...form.register('end_date')}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Campaign Logo</Label>
                    <div className="mt-1">
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="h-20 w-20 object-contain" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> your campaign logo
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                            </div>
                          )}
                          <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/brand-dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Campaign Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Budget Requirements</h4>
                  <p className="text-sm text-muted-foreground">
                    Minimum budget is $10 USD. You can pay in NGN at current exchange rate (₦1500/$1).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Approval Process</h4>
                  <p className="text-sm text-muted-foreground">
                    Your campaign must be funded before admin approval. Rejected campaigns receive automatic refunds.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Content Guidelines</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure your content follows our community guidelines and provides clear instructions for participants.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreate;