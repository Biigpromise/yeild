
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DollarSign, ImageIcon, CalendarIcon } from "lucide-react";

interface TaskFormFieldsProps {
  formData: any;
  onInputChange: (field: string, value: string | boolean) => void;
}

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="points">Points Reward *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) => onInputChange('points', e.target.value)}
              placeholder="50"
              min="1"
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(value) => onInputChange('difficulty', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="task_type">Task Type</Label>
          <Select value={formData.task_type} onValueChange={(value) => onInputChange('task_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="survey">Survey</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="download">App Download</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="brand_name">Brand Name (Optional)</Label>
          <Input
            id="brand_name"
            value={formData.brand_name}
            onChange={(e) => onInputChange('brand_name', e.target.value)}
            placeholder="Brand or company name"
          />
        </div>
        
        <div>
          <Label htmlFor="brand_logo_url">Brand Logo URL (Optional)</Label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="brand_logo_url"
              value={formData.brand_logo_url}
              onChange={(e) => onInputChange('brand_logo_url', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="pl-10"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="estimated_time">Estimated Time (Optional)</Label>
          <Input
            id="estimated_time"
            value={formData.estimated_time}
            onChange={(e) => onInputChange('estimated_time', e.target.value)}
            placeholder="e.g., 5 minutes, 1 hour"
          />
        </div>
        
        <div>
          <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => onInputChange('expires_at', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="status"
            checked={formData.status === 'active'}
            onCheckedChange={(checked) => onInputChange('status', checked ? 'active' : 'draft')}
          />
          <Label htmlFor="status">Active Task</Label>
        </div>
      </div>
    </div>
  );
};
