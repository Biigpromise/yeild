// Task difficulty configuration with dynamic point minimums

export const DIFFICULTY_POINT_MINIMUMS = {
  easy: 300,
  medium: 500,
  hard: 800,
  expert: 1200
} as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', minPoints: 300, description: 'Simple tasks, quick completion' },
  { value: 'medium', label: 'Medium', minPoints: 500, description: 'Moderate effort required' },
  { value: 'hard', label: 'Hard', minPoints: 800, description: 'Complex tasks, significant effort' },
  { value: 'expert', label: 'Expert', minPoints: 1200, description: 'High-skill tasks, specialized knowledge' }
] as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_POINT_MINIMUMS;

export const getMinPointsForDifficulty = (difficulty: string): number => {
  const normalizedDifficulty = difficulty?.toLowerCase() as DifficultyLevel;
  return DIFFICULTY_POINT_MINIMUMS[normalizedDifficulty] || DIFFICULTY_POINT_MINIMUMS.easy;
};

export const getDifficultyLabel = (difficulty: string): string => {
  const option = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty?.toLowerCase());
  return option?.label || 'Easy';
};

export const getDifficultyDescription = (difficulty: string): string => {
  const option = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty?.toLowerCase());
  return option?.description || '';
};
