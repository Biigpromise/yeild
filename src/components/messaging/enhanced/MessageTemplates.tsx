import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Plus, Trash2, Edit, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  usageCount: number;
  createdAt: Date;
}

interface MessageTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

export const MessageTemplates: React.FC<MessageTemplatesProps> = ({
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      title: 'Welcome Message',
      content: 'Welcome to our community chat! Feel free to introduce yourself and ask any questions.',
      category: 'greeting',
      usageCount: 15,
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Thank You',
      content: 'Thank you for sharing that valuable insight! It really helps the community.',
      category: 'appreciation',
      usageCount: 8,
      createdAt: new Date()
    },
    {
      id: '3',
      title: 'Meeting Reminder',
      content: 'Just a friendly reminder about our upcoming meeting. Don\'t forget to prepare your updates!',
      category: 'reminder',
      usageCount: 12,
      createdAt: new Date()
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const categories = ['greeting', 'appreciation', 'reminder', 'question', 'general'];

  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) return;

    const template: MessageTemplate = {
      id: Date.now().toString(),
      title: newTemplate.title,
      content: newTemplate.content,
      category: newTemplate.category,
      usageCount: 0,
      createdAt: new Date()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ title: '', content: '', category: 'general' });
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleUseTemplate = (template: MessageTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));
    onSelectTemplate(template.content);
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Message Templates
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    placeholder="Template title..."
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    placeholder="Template content..."
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate} className="flex-1">
                    Create Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
              <div className="h-px bg-border flex-1" />
            </div>
            
            {categoryTemplates.map(template => (
              <div 
                key={template.id}
                className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{template.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {template.usageCount} uses
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.content}
                </p>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full"
                >
                  <Send className="h-3 w-3 mr-2" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        ))}
        
        {templates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No templates yet. Create your first template to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};