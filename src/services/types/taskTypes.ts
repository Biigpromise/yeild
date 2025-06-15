export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  estimated_time: string;
  difficulty: string;
  task_type: string;
  brand_name: string;
  brand_logo_url?: string;
  status: string;
  created_at: string;
  expires_at?: string;
  social_media_links?: Record<string, string>;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  evidence: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}
