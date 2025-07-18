
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YIELD!',
    description: 'Let\'s take a quick tour to get you started with earning points and leveling up your YEILDER bird.',
    position: 'bottom'
  },
  {
    id: 'bird-status',
    title: 'Your Bird Status',
    description: 'This shows your current bird level, stats, and progress toward the next level. Complete tasks and refer friends to level up!',
    target: '[data-onboarding="bird-status"]',
    position: 'bottom'
  },
  {
    id: 'tasks-tab',
    title: 'Tasks',
    description: 'Browse and complete tasks to earn points. Each task has different rewards and difficulty levels.',
    target: '[data-value="tasks"]',
    position: 'bottom'
  },
  {
    id: 'profile-tab',
    title: 'Your Profile',
    description: 'Manage your profile information and view your achievements here.',
    target: '[data-value="profile"]',
    position: 'bottom'
  },
  {
    id: 'wallet-tab',
    title: 'Wallet',
    description: 'Track your points and set up withdrawals when you\'re ready to cash out.',
    target: '[data-value="wallet"]',
    position: 'bottom'
  },
  {
    id: 'referrals-tab',
    title: 'Referrals',
    description: 'Invite friends to join YIELD and earn bonus points when they complete tasks.',
    target: '[data-value="referrals"]',
    position: 'bottom'
  }
];
