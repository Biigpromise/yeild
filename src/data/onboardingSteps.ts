
import { OnboardingStep } from '@/components/ui/onboarding-tutorial';

export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'success-stories',
    title: 'Real Success Stories',
    description: 'Meet users who\'ve earned thousands through YEILD. Sarah earned $2,847 in 3 months, Mike made $1,923 as a side hustle.',
    target: '[data-onboarding="dashboard"]',
    position: 'bottom'
  },
  {
    id: 'task-earnings',
    title: 'Easy Tasks, Real Money',
    description: 'Complete simple tasks from brands and earn $5-$50 per task. Over 47,000 tasks completed today with instant payouts.',
    target: '[data-onboarding="tasks"]',
    position: 'bottom'
  },
  {
    id: 'bird-referrals',
    title: 'Bird Referral System',
    description: 'Fly higher with referrals! Start as a Dove, become a Phoenix. Each referral earns you 10-30 points plus exclusive perks.',
    target: '[data-onboarding="referrals"]',
    position: 'bottom'
  },
  {
    id: 'community-growth',
    title: 'Thriving Community',
    description: 'Join 125,000+ active users and 387 brands. Track your progress on leaderboards and compete for bonus rewards.',
    target: '[data-onboarding="leaderboard"]',
    position: 'bottom'
  },
  {
    id: 'start-earning',
    title: 'Ready to Earn?',
    description: 'Your YEILD wallet is ready! Complete your first task today and join the thousands earning daily through our platform.',
    target: '[data-onboarding="profile"]',
    position: 'bottom'
  }
];
