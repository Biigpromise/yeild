import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Save, Eye, Star, Tag } from 'lucide-react';
import { enhancedTaskManagementService } from '@/services/admin/enhancedTaskManagementService';
import { toast } from 'sonner';
import { useSimpleFormPersistence } from '@/hooks/useSimpleFormPersistence';
import { BudgetEstimateCalculator } from '@/components/brand/BudgetEstimateCalculator';

interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  points: string;
  estimatedTime: string;
  difficulty: string;
  taskType: string;
  brandName: string;
  brandLogoUrl: string;
  expiresAt: string;
  socialMediaLinks: Record<string, string>;
}

const FORM_DRAFT_KEY = "adminTaskCreateTabDraft";

export const AdminCreateTaskTab = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const initialFormData: TaskFormData = {
    title: '',
    description: '',
    category: '',
    points: '',
    estimatedTime: '',
    difficulty: '',
    taskType: 'user_generated',
    brandName: '',
    brandLogoUrl: '',
    expiresAt: '',
    socialMediaLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      linkedin: ''
    }
  };

  const [formData, setFormData] = useState<TaskFormData>(initialFormData);

  const { clearDraft } = useSimpleFormPersistence({
    formData,
    setFormData,
    storageKey: FORM_DRAFT_KEY,
    excludeKeys: [],
  });

  useEffect(() => {
    loadTaskCategories();
  }, []);

  const loadTaskCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await enhancedTaskManagementService.getTaskCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Task description is required');
      return false;
    }
    const pointsValue = parseInt(formData.points);
    if (!formData.points || isNaN(pointsValue) || pointsValue < 300) {
      toast.error('Minimum task value is 300 points');
      return false;
    }
    return true;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        points: parseInt(formData.points),
        estimated_time: formData.estimatedTime,
        difficulty: formData.difficulty,
        task_type: formData.taskType,
        brand_name: formData.brandName,
        brand_logo_url: formData.brandLogoUrl,
        expires_at: formData.expiresAt,
        social_media_links: formData.socialMediaLinks,
        status: 'active'
      };

      const result = await enhancedTaskManagementService.createTask(taskData);
      
      if (result) {
        toast.success('Task created successfully!');
        clearDraft();
        // Reset form
        setFormData(initialFormData);
      }
    } catch (error: any) {
      console.error('Task creation error:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Draft saved! You can continue editing later.');
  };

  const handlePreview = () => {
    if (!formData.title && !formData.description) {
      toast.error('Please add a title and description to preview the task');
      return;
    }
    toast.info('Task preview feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          Create New Task
        </h2>
        <p className="text-muted-foreground">Design and publish tasks for users to complete</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-foreground">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a clear, engaging task title"
                  className="border-border bg-background text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Task Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide detailed instructions on what users need to do..."
                  rows={6}
                  className="border-border bg-background text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-foreground">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty" className="text-foreground">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards & Settings */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Star className="w-5 h-5" />
                Rewards & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points" className="text-foreground">Points Reward * (Minimum: 300)</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', e.target.value)}
                    placeholder="e.g., 300"
                    min="300"
                    className="border-border bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 300 points per task</p>
                </div>

                <div>
                  <Label htmlFor="estimatedTime" className="text-foreground">Estimated Time</Label>
                  <Input
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                    placeholder="e.g., 10 minutes"
                    className="border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taskType" className="text-foreground">Task Type</Label>
                  <Select value={formData.taskType} onValueChange={(value) => handleInputChange('taskType', value)}>
                    <SelectTrigger className="border-border bg-background">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_generated">User Generated</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiresAt" className="text-foreground">Expiration Date</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => handleInputChange('expiresAt', e.target.value)}
                    className="border-border bg-background text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Brand Information (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brandName" className="text-foreground">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  placeholder="Brand or company name"
                  className="border-border bg-background text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="brandLogoUrl" className="text-foreground">Brand Logo URL</Label>
                <Input
                  id="brandLogoUrl"
                  value={formData.brandLogoUrl}
                  onChange={(e) => handleInputChange('brandLogoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="border-border bg-background text-foreground"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Calculator */}
          <BudgetEstimateCalculator />

          {/* Task Summary */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Task Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Reward:</span>
                  <span className="font-medium text-foreground">
                    {formData.points || '0'} points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium text-foreground">
                    {formData.category ? 
                      categories.find(c => c.id === formData.category)?.name || 'Selected' 
                      : 'Not selected'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span className="font-medium text-foreground capitalize">
                    {formData.difficulty || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span className="font-medium text-foreground">
                    {formData.estimatedTime || 'Not specified'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  className="w-full border-border"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Task
                </Button>
                
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="w-full border-border"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                
                <Button
                  onClick={handleCreateTask}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create & Publish Task
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Task Creation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use clear, specific task titles</li>
                <li>• Provide detailed instructions</li>
                <li>• Set appropriate point rewards</li>
                <li>• Consider the target audience</li>
                <li>• Test your task instructions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};