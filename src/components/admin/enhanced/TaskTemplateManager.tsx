
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Template, Copy, Edit, Trash2 } from "lucide-react";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  template_data: any;
  category: string;
  created_at: string;
}

const defaultTemplates = [
  {
    id: "social-follow",
    name: "Social Media Follow",
    description: "Follow a social media account",
    category: "social_media",
    template_data: {
      title: "Follow our [Platform] account",
      description: "Follow our official account on [Platform] and screenshot for verification",
      points: "25",
      difficulty: "easy",
      task_type: "social_media",
      estimated_time: "2 minutes"
    }
  },
  {
    id: "app-download",
    name: "App Download & Review",
    description: "Download app and leave a review",
    category: "download",
    template_data: {
      title: "Download [App Name] and Leave Review",
      description: "Download the app from the store, use it for at least 5 minutes, then leave an honest review",
      points: "100",
      difficulty: "medium",
      task_type: "download",
      estimated_time: "10 minutes"
    }
  },
  {
    id: "survey-feedback",
    name: "Survey Completion",
    description: "Complete a feedback survey",
    category: "survey",
    template_data: {
      title: "Complete Customer Feedback Survey",
      description: "Fill out our detailed customer feedback survey to help us improve our services",
      points: "50",
      difficulty: "easy",
      task_type: "survey",
      estimated_time: "5 minutes"
    }
  }
];

interface TaskTemplateManagerProps {
  onTemplateSelected: (template: any) => void;
}

export const TaskTemplateManager: React.FC<TaskTemplateManagerProps> = ({
  onTemplateSelected
}) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "general"
  });

  useEffect(() => {
    // For now, use default templates. In a real app, these would come from the database
    setTemplates(defaultTemplates as any);
  }, []);

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const template = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      created_at: new Date().toISOString(),
      template_data: {
        title: `[${newTemplate.name}]`,
        description: newTemplate.description,
        points: "50",
        difficulty: "medium",
        task_type: newTemplate.category,
        estimated_time: "5 minutes"
      }
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: "", description: "", category: "general" });
    setIsCreateModalOpen(false);
    toast.success("Template created successfully!");
  };

  const handleUseTemplate = (template: TaskTemplate) => {
    onTemplateSelected(template.template_data);
    toast.success(`Template "${template.name}" applied!`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Template className="h-5 w-5" />
            Task Templates
          </CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Task Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Social Media Follow"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Input
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this template"
                  />
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="survey">Survey</SelectItem>
                      <SelectItem value="download">App Download</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
