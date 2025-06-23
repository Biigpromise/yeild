
export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  profile_picture_url?: string;
  rank: number;
}
