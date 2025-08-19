import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CampaignBasicData {
  title: string;
  description: string;
  category: string;
  logo_url?: string;
}

interface CampaignBasicDetailsProps {
  data: CampaignBasicData;
  onDataChange: (data: CampaignBasicData) => void;
}

const campaignCategories = [
  'Social Media Marketing',
  'Content Creation',
  'Influencer Marketing',
  'Product Launch',
  'Brand Awareness',
  'Lead Generation',
  'Community Building',
  'User Generated Content',
  'Reviews & Testimonials',
  'Event Promotion'
];

export const CampaignBasicDetails: React.FC<CampaignBasicDetailsProps> = ({
  data,
  onDataChange
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo_url || null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof CampaignBasicData, value: string) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `campaign-logo-${Date.now()}.${fileExt}`;
      const filePath = `campaign-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      handleInputChange('logo_url', urlData.publicUrl);
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
    handleInputChange('logo_url', '');
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-base font-medium">Campaign Title *</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter a compelling campaign title that describes your objective"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Choose a clear, descriptive title that participants will easily understand
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-base font-medium">Campaign Description *</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a detailed description of your campaign goals, what you want to achieve, and how participants can help..."
          rows={5}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Include your campaign objectives, target outcomes, and any important context participants should know
        </p>
      </div>

      <div>
        <Label className="text-base font-medium">Campaign Category *</Label>
        <Select value={data.category} onValueChange={(value) => handleInputChange('category', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select campaign category" />
          </SelectTrigger>
          <SelectContent>
            {campaignCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          This helps participants find campaigns that match their skills and interests
        </p>
      </div>

      <div>
        <Label className="text-base font-medium">Campaign Logo</Label>
        <div className="mt-2">
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Campaign logo"
                className="w-32 h-32 object-contain border border-border rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeLogo}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> campaign logo
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
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
        <p className="text-sm text-muted-foreground mt-1">
          Upload your brand or campaign logo to help participants identify your campaign
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Campaign Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Use action words in your title to make it engaging</li>
            <li>• Clearly explain what participants need to do</li>
            <li>• Include any specific requirements or restrictions</li>
            <li>• Set realistic expectations for completion time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};