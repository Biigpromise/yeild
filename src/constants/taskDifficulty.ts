// Task difficulty configuration with dynamic point minimums
// Difficulty is auto-assigned by the platform based on execution mode + proof type.
// Admins can override during approval. Brands cannot set difficulty directly.

export const DIFFICULTY_POINT_MINIMUMS = {
  easy: 500,
  medium: 1500,
  hard: 5000,
  expert: 10000
} as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', minPoints: 500, description: 'Quick digital actions (screenshot, like, follow)' },
  { value: 'medium', label: 'Medium', minPoints: 1500, description: 'Video proof, written reviews, app testing' },
  { value: 'hard', label: 'Hard', minPoints: 5000, description: 'Field visits, signups, multi-step verification' },
  { value: 'expert', label: 'Expert', minPoints: 10000, description: 'Specialized field work or high-trust verification' }
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

/**
 * Auto-assign difficulty based on execution mode + required proof types.
 * Field mode is always at least Hard. Digital depends on proof complexity.
 */
export const autoAssignDifficulty = (
  executionMode: 'digital' | 'field' | string,
  proofTypes: string[] = []
): DifficultyLevel => {
  const mode = executionMode?.toLowerCase();
  const proofs = proofTypes.map(p => p.toLowerCase());

  if (mode === 'field') {
    // Field with multi-proof or geo+id verification = expert
    if (proofs.length >= 3 || proofs.includes('geo') || proofs.includes('id_verification')) {
      return 'expert';
    }
    return 'hard';
  }

  // Digital mode
  if (proofs.includes('video') || proofs.includes('screen_recording')) {
    return 'medium';
  }
  if (proofs.length >= 2) {
    return 'medium';
  }
  return 'easy';
};
