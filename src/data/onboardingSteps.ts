
import { OnboardingStep } from '@/components/ui/onboarding-tutorial';

export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to YEILD!',
    description: 'Let\'s take a quick tour of your new dashboard and show you how to get started earning rewards.',
    target: '[data-onboarding="dashboard"]',
    position: 'bottom'
  },
  {
    id: 'tasks',
    title: 'Browse Tasks',
    description: 'Find and complete tasks to earn points and rewards. Tasks are categorized by difficulty and reward amount.',
    target: '[data-onboarding="tasks"]',
    position: 'bottom'
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Track your progress, level, and achievements. Build your reputation to unlock better tasks.',
    target: '[data-onboarding="profile"]',
    position: 'bottom'
  },
  {
    id: 'rewards',
    title: 'Redeem Rewards',
    description: 'Exchange your earned points for real rewards, gift cards, and cash withdrawals.',
    target: '[data-onboarding="rewards"]',
    position: 'bottom'
  },
  {
    id: 'leaderboard',
    title: 'Compete & Climb',
    description: 'See where you rank among other users and compete for top positions to earn bonus rewards.',
    target: '[data-onboarding="leaderboard"]',
    position: 'bottom'
  }
];
