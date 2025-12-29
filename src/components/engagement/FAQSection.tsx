import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FAQ_ITEMS = [
  {
    id: 'how-earn',
    question: 'How do I earn points on YEILD?',
    answer: 'You can earn points by completing tasks from brands, referring friends, logging in daily, and spinning the lucky wheel. Each task has different point values depending on its complexity.'
  },
  {
    id: 'withdraw',
    question: 'How do I withdraw my earnings?',
    answer: 'Once you\'ve earned enough points, you can transfer them to your Yield Wallet and then request a withdrawal to your bank account. The minimum withdrawal amount is 1,000 points (₦1,000). Withdrawals are processed within 24-48 hours.'
  },
  {
    id: 'points-value',
    question: 'How much are points worth?',
    answer: 'Points are converted at a rate of 1 point = ₦1 NGN. So if you have 5,000 points, you can withdraw ₦5,000 to your bank account.'
  },
  {
    id: 'referral',
    question: 'How does the referral program work?',
    answer: 'When you invite friends using your referral link, you earn bonus points when they sign up and complete their first task. The more friends you refer, the more you earn!'
  },
  {
    id: 'bird-levels',
    question: 'What are Bird Levels?',
    answer: 'Bird Levels are a gamification feature that rewards your activity on the platform. As you earn more points and complete more tasks, you level up through different bird tiers (Sparrow → Eagle → Phoenix, etc.), unlocking special perks and higher earning multipliers.'
  },
  {
    id: 'task-approval',
    question: 'Why is my task pending approval?',
    answer: 'After you submit a task, it goes through a verification process to ensure it was completed correctly. This usually takes 24-48 hours. Once approved, points are automatically added to your account.'
  },
  {
    id: 'yield-wallet',
    question: 'What is the Yield Wallet?',
    answer: 'The Yield Wallet is a secure holding area for your points before withdrawal. You can transfer points from your main balance to the Yield Wallet when you\'re ready to cash out.'
  },
  {
    id: 'account-security',
    question: 'How is my account secured?',
    answer: 'We use industry-standard security measures including encrypted connections, secure authentication, and protected payment processing. Never share your login credentials with anyone.'
  }
];

interface FAQSectionProps {
  compact?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const displayItems = compact ? FAQ_ITEMS.slice(0, 4) : FAQ_ITEMS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Quick answers to common questions
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {displayItems.map((item, index) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left text-sm hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {compact && (
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate('/faq')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                View All FAQs
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate('/support')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
