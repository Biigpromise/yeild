import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, X, Clock, Target, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Deliverable {
  id: string;
  type: 'post' | 'story' | 'reel' | 'video' | 'review' | 'unboxing' | 'tutorial';
  quantity: number;
  specifications: string;
  deadline?: string;
}

interface CampaignBriefData {
  brief: string;
  objectives: string[];
  deliverables: Deliverable[];
  content_guidelines: string;
  brand_voice: string;
  do_and_dont: {
    dos: string[];
    donts: string[];
  };
  success_metrics: string[];
}

interface CampaignBriefSectionProps {
  briefData: CampaignBriefData;
  onBriefDataChange: (data: CampaignBriefData) => void;
}

const deliverableTypes = [
  { value: 'post', label: 'Social Media Post' },
  { value: 'story', label: 'Story/Story Highlight' },
  { value: 'reel', label: 'Reel/Short Video' },
  { value: 'video', label: 'Long-form Video' },
  { value: 'review', label: 'Product Review' },
  { value: 'unboxing', label: 'Unboxing Video' },
  { value: 'tutorial', label: 'Tutorial/How-to' },
];

const campaignTemplates = [
  {
    name: 'Product Launch',
    brief: 'Help us introduce our new product to your audience through authentic content creation.',
    objectives: ['Increase brand awareness', 'Drive product sales', 'Generate user-generated content'],
    deliverables: [
      { id: '1', type: 'post' as const, quantity: 2, specifications: 'High-quality product photos with lifestyle context' },
      { id: '2', type: 'story' as const, quantity: 3, specifications: 'Behind-the-scenes content and product usage' }
    ]
  },
  {
    name: 'Brand Awareness',
    brief: 'Create engaging content that showcases our brand values and connects with your audience.',
    objectives: ['Increase brand visibility', 'Build brand affinity', 'Reach new audiences'],
    deliverables: [
      { id: '1', type: 'post' as const, quantity: 1, specifications: 'Authentic brand integration in your content style' },
      { id: '2', type: 'story' as const, quantity: 2, specifications: 'Brand mention with personal touch' }
    ]
  },
  {
    name: 'Event Promotion',
    brief: 'Help promote our upcoming event and encourage attendance through compelling content.',
    objectives: ['Drive event registrations', 'Create event buzz', 'Increase social engagement'],
    deliverables: [
      { id: '1', type: 'post' as const, quantity: 1, specifications: 'Event announcement with compelling visuals' },
      { id: '2', type: 'story' as const, quantity: 1, specifications: 'Event countdown and details' }
    ]
  }
];

export const CampaignBriefSection: React.FC<CampaignBriefSectionProps> = ({
  briefData,
  onBriefDataChange
}) => {
  const [newObjective, setNewObjective] = useState('');
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');
  const [newMetric, setNewMetric] = useState('');

  const loadTemplate = (template: typeof campaignTemplates[0]) => {
    onBriefDataChange({
      ...briefData,
      brief: template.brief,
      objectives: template.objectives,
      deliverables: template.deliverables
    });
    toast.success(`Loaded ${template.name} template`);
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      onBriefDataChange({
        ...briefData,
        objectives: [...briefData.objectives, newObjective.trim()]
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    onBriefDataChange({
      ...briefData,
      objectives: briefData.objectives.filter((_, i) => i !== index)
    });
  };

  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: Date.now().toString(),
      type: 'post',
      quantity: 1,
      specifications: ''
    };
    onBriefDataChange({
      ...briefData,
      deliverables: [...briefData.deliverables, newDeliverable]
    });
  };

  const updateDeliverable = (id: string, field: keyof Deliverable, value: any) => {
    onBriefDataChange({
      ...briefData,
      deliverables: briefData.deliverables.map(d => 
        d.id === id ? { ...d, [field]: value } : d
      )
    });
  };

  const removeDeliverable = (id: string) => {
    onBriefDataChange({
      ...briefData,
      deliverables: briefData.deliverables.filter(d => d.id !== id)
    });
  };

  const addDo = () => {
    if (newDo.trim()) {
      onBriefDataChange({
        ...briefData,
        do_and_dont: {
          ...briefData.do_and_dont,
          dos: [...briefData.do_and_dont.dos, newDo.trim()]
        }
      });
      setNewDo('');
    }
  };

  const addDont = () => {
    if (newDont.trim()) {
      onBriefDataChange({
        ...briefData,
        do_and_dont: {
          ...briefData.do_and_dont,
          donts: [...briefData.do_and_dont.donts, newDont.trim()]
        }
      });
      setNewDont('');
    }
  };

  const addMetric = () => {
    if (newMetric.trim()) {
      onBriefDataChange({
        ...briefData,
        success_metrics: [...briefData.success_metrics, newMetric.trim()]
      });
      setNewMetric('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Campaign Brief & Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates */}
        <div className="space-y-3">
          <Label>Quick Start Templates</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {campaignTemplates.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => loadTemplate(template)}
              >
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.brief.substring(0, 60)}...
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Campaign Brief */}
        <div className="space-y-2">
          <Label htmlFor="brief">Campaign Brief</Label>
          <Textarea
            id="brief"
            value={briefData.brief}
            onChange={(e) => onBriefDataChange({ ...briefData, brief: e.target.value })}
            placeholder="Describe your campaign in detail. What is the main goal? What message do you want to convey? What should creators know about your brand?"
            rows={4}
          />
        </div>

        {/* Campaign Objectives */}
        <div className="space-y-3">
          <Label>Campaign Objectives</Label>
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add an objective"
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button onClick={addObjective}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {briefData.objectives.map((objective, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {objective}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4 ml-1"
                  onClick={() => removeObjective(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Content Deliverables</Label>
            <Button variant="outline" size="sm" onClick={addDeliverable}>
              <Plus className="w-4 h-4 mr-2" />
              Add Deliverable
            </Button>
          </div>
          
          {briefData.deliverables.map((deliverable) => (
            <div key={deliverable.id} className="p-4 border border-border rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select
                  value={deliverable.type}
                  onValueChange={(value) => updateDeliverable(deliverable.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {deliverableTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  value={deliverable.quantity}
                  onChange={(e) => updateDeliverable(deliverable.id, 'quantity', parseInt(e.target.value))}
                  placeholder="Quantity"
                />

                <Input
                  type="date"
                  value={deliverable.deadline || ''}
                  onChange={(e) => updateDeliverable(deliverable.id, 'deadline', e.target.value)}
                  placeholder="Deadline (optional)"
                />
              </div>

              <Textarea
                value={deliverable.specifications}
                onChange={(e) => updateDeliverable(deliverable.id, 'specifications', e.target.value)}
                placeholder="Detailed specifications for this deliverable..."
                rows={2}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDeliverable(deliverable.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          ))}
        </div>

        {/* Content Guidelines */}
        <div className="space-y-2">
          <Label htmlFor="guidelines">Content Guidelines</Label>
          <Textarea
            id="guidelines"
            value={briefData.content_guidelines}
            onChange={(e) => onBriefDataChange({ ...briefData, content_guidelines: e.target.value })}
            placeholder="Specific guidelines for content creation (style, tone, format, etc.)"
            rows={3}
          />
        </div>

        {/* Brand Voice */}
        <div className="space-y-2">
          <Label htmlFor="brand-voice">Brand Voice & Personality</Label>
          <Textarea
            id="brand-voice"
            value={briefData.brand_voice}
            onChange={(e) => onBriefDataChange({ ...briefData, brand_voice: e.target.value })}
            placeholder="Describe your brand's personality and how creators should represent it"
            rows={2}
          />
        </div>

        {/* Do's and Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Do's</Label>
            <div className="flex gap-2">
              <Input
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                placeholder="Add a do"
                onKeyPress={(e) => e.key === 'Enter' && addDo()}
              />
              <Button onClick={addDo}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {briefData.do_and_dont.dos.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  <span className="flex-1 text-sm">{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => onBriefDataChange({
                      ...briefData,
                      do_and_dont: {
                        ...briefData.do_and_dont,
                        dos: briefData.do_and_dont.dos.filter((_, i) => i !== index)
                      }
                    })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Don'ts</Label>
            <div className="flex gap-2">
              <Input
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                placeholder="Add a don't"
                onKeyPress={(e) => e.key === 'Enter' && addDont()}
              />
              <Button onClick={addDont}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {briefData.do_and_dont.donts.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                  <X className="w-4 h-4 text-red-600" />
                  <span className="flex-1 text-sm">{item}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => onBriefDataChange({
                      ...briefData,
                      do_and_dont: {
                        ...briefData.do_and_dont,
                        donts: briefData.do_and_dont.donts.filter((_, i) => i !== index)
                      }
                    })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="space-y-3">
          <Label>Success Metrics</Label>
          <div className="flex gap-2">
            <Input
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
              placeholder="Add a success metric"
              onKeyPress={(e) => e.key === 'Enter' && addMetric()}
            />
            <Button onClick={addMetric}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {briefData.success_metrics.map((metric, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {metric}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4 ml-1"
                  onClick={() => onBriefDataChange({
                    ...briefData,
                    success_metrics: briefData.success_metrics.filter((_, i) => i !== index)
                  })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};