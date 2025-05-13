
export interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
  targetElement?: string;
}

export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to YEILD!",
    description: "YEILD is a platform where you can complete tasks to earn rewards. This quick tutorial will guide you through the main features of the platform. Let's get started!",
    image: "/lovable-uploads/7fc77d60-4b87-4411-98a7-2be548a56630.png", // Using the uploaded welcome image
  },
  {
    title: "Your Dashboard",
    description: "Your dashboard gives you an overview of your points, tasks completed, earnings, and current level. You can track your progress and see your achievements here.",
    targetElement: ".yeild-card",
    image: "/assets/tutorial/dashboard.png",
  },
  {
    title: "Available Tasks",
    description: "Browse through available tasks that you can complete to earn points. Tasks vary in difficulty and rewards. Click on a task to view more details and accept it.",
    targetElement: '[data-tab="tasks"]',
    image: "/assets/tutorial/tasks.png",
  },
  {
    title: "Your Wallet",
    description: "Track your earnings in your wallet. You can withdraw funds or convert points to different rewards like gift cards. Your earnings are calculated based on the points you earn.",
    targetElement: '[data-tab="wallet"]',
    image: "/assets/tutorial/wallet.png",
  },
  {
    title: "Leaderboard",
    description: "See how you rank against other users. The leaderboard shows top performers based on points earned. Climb the ranks by completing more tasks!",
    targetElement: '[data-tab="leaderboard"]',
    image: "/assets/tutorial/leaderboard.png",
  },
  {
    title: "Referral Program",
    description: "Earn additional rewards by referring friends to YEILD. You'll receive a percentage of what your referrals earn. The more friends you bring, the more you earn!",
    targetElement: '[data-tab="referrals"]',
    image: "/assets/tutorial/referrals.png",
  },
  {
    title: "Level Up!",
    description: "As you complete tasks, you'll earn points and level up. Higher levels unlock better rewards, exclusive tasks, and special perks. Keep completing tasks to level up faster!",
    image: "/assets/tutorial/level-up.png",
  },
  {
    title: "You're all set!",
    description: "Congratulations! You now know the basics of YEILD. Start exploring the platform, complete tasks, and earn rewards. If you need help, you can restart this tutorial from the settings menu. Happy earning!",
    image: "/assets/tutorial/congrats.png",
  }
];
