
import { toast } from "sonner";

export interface TaskFormData {
  title: string;
  description: string;
  points: string;
  category_id: string;
  difficulty: string;
  brand_name: string;
  brand_logo_url: string;
  estimated_time: string;
  expires_at: string;
  status: string;
  task_type: string;
  social_media_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
}

export const validateTaskForm = (formData: TaskFormData): boolean => {
  if (!formData.title.trim()) {
    toast.error("Task title is required");
    return false;
  }

  if (!formData.description.trim()) {
    toast.error("Task description is required");
    return false;
  }

  if (!formData.points || isNaN(Number(formData.points)) || Number(formData.points) <= 0) {
    toast.error("Please enter a valid points value");
    return false;
  }

  if (formData.task_type === 'social_media') {
    const hasAnySocialLink = Object.values(formData.social_media_links).some(link => link.trim() !== '');
    if (!hasAnySocialLink) {
      toast.error("At least one social media link is required for social media tasks");
      return false;
    }
  }

  return true;
};

export const prepareTaskData = (formData: TaskFormData) => {
  const taskData: any = {
    title: formData.title.trim(),
    description: formData.description.trim(),
    points: parseInt(formData.points),
    difficulty: formData.difficulty,
    brand_name: formData.brand_name.trim(),
    estimated_time: formData.estimated_time,
    status: formData.status,
    task_type: formData.task_type,
  };

  // Add category_id if provided
  if (formData.category_id) {
    taskData.category_id = formData.category_id;
  }

  // Add brand_logo_url if provided
  if (formData.brand_logo_url?.trim()) {
    taskData.brand_logo_url = formData.brand_logo_url.trim();
  }

  // Add expires_at if provided
  if (formData.expires_at) {
    taskData.expires_at = new Date(formData.expires_at).toISOString();
  }

  // Add social media links if task type is social_media
  if (formData.task_type === 'social_media') {
    // Filter out empty links
    const filteredLinks = Object.entries(formData.social_media_links)
      .filter(([_, url]) => url.trim() !== '')
      .reduce((acc, [platform, url]) => {
        acc[platform] = url.trim();
        return acc;
      }, {} as Record<string, string>);
    
    if (Object.keys(filteredLinks).length > 0) {
      taskData.social_media_links = filteredLinks;
    }
  }

  return taskData;
};
