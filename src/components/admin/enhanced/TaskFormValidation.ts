
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
  };
}

export const validateTaskForm = (formData: TaskFormData): boolean => {
  // Basic validation
  if (!formData.title?.trim()) {
    toast.error("Task title is required");
    return false;
  }

  if (!formData.description?.trim()) {
    toast.error("Task description is required");
    return false;
  }

  if (!formData.points || parseInt(formData.points) <= 0) {
    toast.error("Points must be greater than 0");
    return false;
  }

  return true;
};

export const prepareTaskData = (formData: TaskFormData) => {
  // Prepare social media links
  const socialLinks = Object.entries(formData.social_media_links)
    .filter(([_, value]) => value && value.trim() !== '')
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

  // Prepare task data
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    points: parseInt(formData.points),
    difficulty: formData.difficulty || 'medium',
    brand_name: formData.brand_name?.trim() || null,
    brand_logo_url: formData.brand_logo_url?.trim() || null,
    estimated_time: formData.estimated_time?.trim() || null,
    expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    status: formData.status,
    task_type: formData.task_type,
    social_media_links: formData.task_type === 'social_media' && Object.keys(socialLinks).length > 0 ? socialLinks : null,
    category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id : null
  };
};
