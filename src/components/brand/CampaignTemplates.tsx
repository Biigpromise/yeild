
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Share
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignTemplate {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  template_data: any;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateFormData {
  name: string;
  description: string;
  template_data: {
    title: string;
    description: string;
    budget: number;
    target_audience: string;
    requirements: string;
  };
  is_shared: boolean;
}

export const CampaignTemplates = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    template_data: {
      title: '',
      description: '',
      budget: 0,
      target_audience: '',
      requirements: '',
    },
    is_shared: false,
  });

  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['campaign-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CampaignTemplate[];
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: TemplateFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('campaign_templates')
        .insert([{
          ...templateData,
          brand_id: user.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Template created successfully');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TemplateFormData }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('campaign_templates')
        .update({
          ...data,
          brand_id: user.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('campaign_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    },
  });

  const duplicateTemplateMutation = useMutation({
    mutationFn: async (template: CampaignTemplate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const duplicateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        template_data: template.template_data,
        is_shared: false,
        brand_id: user.id
      };

      const { error } = await supabase
        .from('campaign_templates')
        .insert([duplicateData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] });
      toast.success('Template duplicated successfully');
    },
    onError: (error) => {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      template_data: {
        title: '',
        description: '',
        budget: 0,
        target_audience: '',
        requirements: '',
      },
      is_shared: false,
    });
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      template_data: template.template_data,
      is_shared: template.is_shared,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, data: formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Campaign Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Campaign Templates
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Campaign Template</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={formData.template_data.budget}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        template_data: { 
                          ...prev.template_data, 
                          budget: Number(e.target.value) 
                        } 
                      }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.template_data.title}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      template_data: { 
                        ...prev.template_data, 
                        title: e.target.value 
                      } 
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-description">Campaign Description</Label>
                  <Textarea
                    id="campaign-description"
                    value={formData.template_data.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      template_data: { 
                        ...prev.template_data, 
                        description: e.target.value 
                      } 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    value={formData.template_data.target_audience}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      template_data: { 
                        ...prev.template_data, 
                        target_audience: e.target.value 
                      } 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.template_data.requirements}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      template_data: { 
                        ...prev.template_data, 
                        requirements: e.target.value 
                      } 
                    }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-shared"
                    checked={formData.is_shared}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_shared: checked }))}
                  />
                  <Label htmlFor="is-shared">Share with other brands</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!templates || templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No templates created yet</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    <div className="flex items-center gap-1">
                      {template.is_shared && (
                        <Badge variant="secondary" className="text-xs">
                          <Share className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">${template.template_data.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTemplateMutation.mutate(template)}
                      disabled={duplicateTemplateMutation.isPending}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplateMutation.mutate(template.id)}
                      disabled={deleteTemplateMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Campaign Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-budget">Budget</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={formData.template_data.budget}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    template_data: { 
                      ...prev.template_data, 
                      budget: Number(e.target.value) 
                    } 
                  }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-title">Campaign Title</Label>
              <Input
                id="edit-title"
                value={formData.template_data.title}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  template_data: { 
                    ...prev.template_data, 
                    title: e.target.value 
                  } 
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-campaign-description">Campaign Description</Label>
              <Textarea
                id="edit-campaign-description"
                value={formData.template_data.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  template_data: { 
                    ...prev.template_data, 
                    description: e.target.value 
                  } 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-target-audience">Target Audience</Label>
              <Input
                id="edit-target-audience"
                value={formData.template_data.target_audience}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  template_data: { 
                    ...prev.template_data, 
                    target_audience: e.target.value 
                  } 
                }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-requirements">Requirements</Label>
              <Textarea
                id="edit-requirements"
                value={formData.template_data.requirements}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  template_data: { 
                    ...prev.template_data, 
                    requirements: e.target.value 
                  } 
                }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is-shared"
                checked={formData.is_shared}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_shared: checked }))}
              />
              <Label htmlFor="edit-is-shared">Share with other brands</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTemplateMutation.isPending}>
                {updateTemplateMutation.isPending ? 'Updating...' : 'Update Template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
