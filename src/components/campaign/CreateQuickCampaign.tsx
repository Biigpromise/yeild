import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Zap, Target, Clock, Upload, Image as ImageIcon, X } from 'lucide-react';

interface QuickCampaignFormData {
  title: string;
  description: string;
  budget: number;
  target_audience: string;
  requirements: string;
  category: string;
  duration: string;
  logo_url: string;
}

export const CreateQuickCampaign = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<QuickCampaignFormData>({
    title: '',
    description: '',
    budget: 5000,
    target_audience: '',
    requirements: '',
    category: '',
    duration: '7',
    logo_url: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: QuickCampaignFormData) => {
      if (!user) throw new Error('Not authenticated');

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(campaignData.duration));

      const { error } = await supabase
        .from('brand_campaigns')
        .insert([{
          brand_id: user.id,
          title: campaignData.title,
          description: campaignData.description,
          category: campaignData.category,
          logo_url: campaignData.logo_url,
          budget: campaignData.budget,
          target_audience: { description: campaignData.target_audience },
          requirements: { description: campaignData.requirements },
          status: 'draft',
          admin_approval_status: 'pending',
          payment_status: 'unpaid',
          start_date: new Date().toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          campaign_brief: `Quick campaign created for ${campaignData.category}`,
          deliverable_specifications: {
            deliverables: [
              {
                type: 'social_post',
                platform: 'instagram',
                quantity: 1,
                requirements: campaignData.requirements
              }
            ],
            contentGuidelines: 'Follow brand guidelines and campaign requirements',
            brandVoice: 'Professional and engaging'
          }
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Quick campaign created successfully!');
      navigate('/brand-dashboard/campaigns');
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }
    createCampaignMutation.mutate(formData);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `campaign-logo-${Date.now()}.${fileExt}`;
      const filePath = `campaign-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('campaign-media')
        .getPublicUrl(filePath);

      updateFormData('logo_url', urlData.publicUrl);
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
      setLogoPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    updateFormData('logo_url', '');
  };

  const updateFormData = (field: keyof QuickCampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/brand-dashboard')}
            className="mb-4 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              Quick Campaign Creator
            </h1>
            <p className="text-muted-foreground">
              Create and launch your campaign in minutes with our streamlined process
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Campaign Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Campaign Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    placeholder="Enter a compelling campaign title"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Campaign Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Describe your campaign objectives and key messaging"
                    rows={3}
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">
                      Campaign Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                        <SelectItem value="product_launch">Product Launch</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="lead_generation">Lead Generation</SelectItem>
                        <SelectItem value="sales_promotion">Sales Promotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Campaign Duration
                    </Label>
                    <Select value={formData.duration} onValueChange={(value) => updateFormData('duration', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                        <SelectItem value="30">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Campaign Logo (Optional)</Label>
                  <div className="mt-1">
                    {logoPreview || formData.logo_url ? (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview || formData.logo_url}
                          alt="Campaign logo"
                          className="w-24 h-24 object-contain border border-border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                          onClick={removeLogo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex flex-col items-center justify-center">
                            {uploading ? (
                              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Upload logo</p>
                              </>
                            )}
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-sm font-medium">
                    Campaign Budget (₦) *
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => updateFormData('budget', Number(e.target.value))}
                    placeholder="Enter your budget"
                    min="1000"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum budget: ₦1,000
                  </p>
                </div>

                <div>
                  <Label htmlFor="target-audience" className="text-sm font-medium">
                    Target Audience
                  </Label>
                  <Input
                    id="target-audience"
                    value={formData.target_audience}
                    onChange={(e) => updateFormData('target_audience', e.target.value)}
                    placeholder="e.g., Young professionals aged 25-35 in Lagos"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="requirements" className="text-sm font-medium">
                    Campaign Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => updateFormData('requirements', e.target.value)}
                    placeholder="Specify any requirements for content creators..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/brand-dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {createCampaignMutation.isPending ? (
                    <>Creating Campaign...</>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Create Quick Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-dashed bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <h4 className="font-medium text-foreground mb-1">Quick Campaign Benefits</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Fast approval process (usually within 24 hours)</li>
                  <li>• Simplified requirements for content creators</li>
                  <li>• Automated matching with suitable influencers</li>
                  <li>• Real-time performance tracking</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};