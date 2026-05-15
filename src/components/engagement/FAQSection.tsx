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
    question: 'How do I earn Credits as an Operator?',
    answer: 'Operators earn Credits by completing Execution Orders posted by verified Brands. Each Order specifies the work required, the Credit reward, and the verification criteria. Credits are released after YEILD verifies your proof of completion.'
  },
  {
    id: 'credits-value',
    question: 'How much is 1 Credit worth?',
    answer: '1 Credit = ₦1 NGN. Every Order is funded upfront by the Brand in real currency, so the value behind your Credits is guaranteed before you ever start work.'
  },
  {
    id: 'escrow',
    question: 'How does the escrow protect me?',
    answer: 'When a Brand creates an Execution Order, the full Credit amount is locked in escrow upfront. Brands cannot pull funds out once Operators start work. After your proof is verified, Credits are held in a 7-day clearance window before becoming withdrawable — this protects against fraud disputes on both sides.'
  },
  {
    id: 'verification-authority',
    question: 'Who decides if my work is approved?',
    answer: 'YEILD is the sole verification authority — not the Brand. This protects Operators from arbitrary rejections. Verification takes 24–72 hours and is based on the proof requirements published with the Execution Order.'
  },
  {
    id: 'withdraw',
    question: 'How do I withdraw my Credits?',
    answer: 'Move cleared Credits to your Yield Wallet and request a payout to your verified bank account. Minimum withdrawal is 1,000 Credits (₦1,000). Bank payouts are processed via Paystack and Flutterwave (2% fee). Internal Yield Wallet transfers are free.'
  },
  {
    id: 'referral',
    question: 'How does the referral program work?',
    answer: 'Invite Operators or Brands with your referral link. You earn bonus Credits when they complete their first verified Execution Order. Referral rewards are paid only on verified outcomes — no rewards for empty signups.'
  },
  {
    id: 'operator-ranks',
    question: 'What are Operator Ranks?',
    answer: 'Ranks (Dove → Hawk → Eagle → Falcon → Phoenix) reflect your verified track record. Higher ranks unlock higher-value Orders, Field Mode (Eagle+), faster verification queues, and stronger earning multipliers. Ranks decay if fraud is detected.'
  },
  {
    id: 'account-security',
    question: 'How is my account secured?',
    answer: 'Encrypted connections, device and IP fingerprinting, duplicate-proof detection, and bank-grade payment processing. Never share your login credentials. Self-dealing between your Operator and Brand accounts is automatically blocked.'
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
