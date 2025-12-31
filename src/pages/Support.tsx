import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  ArrowLeft,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I earn points?",
    answer: "You can earn points by completing tasks, referring friends, and participating in campaigns. Each task has a specific point value shown before you start."
  },
  {
    question: "How do I withdraw my earnings?",
    answer: "Go to your Wallet tab and click 'Withdraw'. You can withdraw to your bank account once you reach the minimum withdrawal amount. Processing typically takes 1-3 business days."
  },
  {
    question: "What are Bird Levels?",
    answer: "Bird Levels represent your progress on the platform. As you complete more tasks and earn points, you level up from Dove to Phoenix, unlocking exclusive benefits at each level."
  },
  {
    question: "How does the referral program work?",
    answer: "Share your unique referral link with friends. When they sign up and become active users, both of you earn bonus points. The more active referrals you have, the higher your Bird Level."
  },
  {
    question: "Why was my task submission rejected?",
    answer: "Task submissions may be rejected if they don't meet the requirements, contain incorrect information, or violate our guidelines. Check the task instructions carefully and resubmit if possible."
  },
  {
    question: "How long does withdrawal processing take?",
    answer: "Bank transfers typically take 1-3 business days. You'll receive a notification once your withdrawal is processed and the funds are on their way."
  }
];

export default function Support() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Your message has been sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <YieldLogo size={32} />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              YEILD
            </span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Help & Support</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find answers to common questions or get in touch with our support team.
            </p>
          </div>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input 
                      placeholder="Your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      type="email" 
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Describe your issue or question..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <ArrowLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Back to Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Return to your dashboard</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = 'mailto:support@yeild.com'}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Us Directly</h3>
                  <p className="text-sm text-muted-foreground">support@yeild.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
