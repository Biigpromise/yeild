import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { ArrowLeft, ShieldCheck, Lock, Gavel, Target, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Verified Outcomes, Not Views',
    body: 'Brands pay for proven, completed work — never for engagement, watch-time, or vanity metrics. Every Execution Order ships with explicit proof requirements.'
  },
  {
    icon: Gavel,
    title: 'Sole Verification Authority',
    body: 'YEILD — not the Brand — is the final judge of whether work meets the published criteria. Operators are protected from arbitrary rejections; Brands get consistent, professional review within 24–72 hours.'
  },
  {
    icon: Lock,
    title: 'Funded Upfront, Held in Escrow',
    body: 'Every Execution Order is fully funded before it goes live. Operator earnings sit in a 7-day clearance window before withdrawal — protecting both sides from fraud and chargebacks.'
  },
  {
    icon: Target,
    title: 'Real Currency, Real Payouts',
    body: '1 Credit = ₦1 NGN. Withdrawals settle to verified bank accounts via Paystack and Flutterwave. Minimum payout is 1,000 Credits.'
  }
];

const About: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'About YEILD — Professional Execution Marketplace';
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const [name, key] = selector.replace(/[\[\]"]/g, '').split('=');
        el.setAttribute(name, key);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', 'YEILD is a professional execution marketplace where Brands fund verified outcomes and Operators earn real currency for proven work.');
    setMeta('meta[property="og:title"]', 'content', 'About YEILD — Verified Work, Guaranteed Outcomes');
    setMeta('meta[property="og:description"]', 'content', 'A professional execution marketplace built on verified outcomes, escrow funding, and sole verification authority.');
    setMeta('meta[property="og:url"]', 'content', 'https://yeildsocials.com/about');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <YieldLogo size={32} />
              <span className="font-bold text-xl">YEILD</span>
            </div>
          </div>
          <Button onClick={() => navigate('/auth?mode=signup')} size="sm" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Professional Execution Marketplace
          </span>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Verified Work.<br />
            <span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
              Guaranteed Outcomes.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            YEILD exists to replace the broken "pay-for-engagement" advertising model with a high-trust marketplace where Brands fund real outcomes and Operators are paid in real currency for proven work.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-8 lg:p-10">
              <h2 className="text-2xl font-bold mb-4">The problem we are solving</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Traditional ad platforms reward attention, not action. Brands burn budget on impressions that never convert, while creators and gig workers chase opaque algorithms with no payment guarantee. Disputes are decided by whoever holds the funds — usually not the worker.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                YEILD flips that. Every Execution Order is fully funded upfront, every proof is verified by a neutral third party (us), and every Credit is backed 1:1 by Naira sitting in escrow. No watch-to-earn. No vanity metrics. No silent rejections.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center">What makes YEILD different</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} className="border-border/60 hover:border-primary/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <Users className="h-6 w-6 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">Operators</div>
                <p className="text-sm text-muted-foreground mt-2">Professional executors ranked Dove → Phoenix based on verified track record.</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <Target className="h-6 w-6 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">Execution Orders</div>
                <p className="text-sm text-muted-foreground mt-2">Brand-funded jobs with explicit proof requirements and locked-in budgets.</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-6">
                <TrendingUp className="h-6 w-6 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold">Credits</div>
                <p className="text-sm text-muted-foreground mt-2">1 Credit = ₦1. Withdrawable to verified bank accounts after escrow clearance.</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 lg:p-12">
              <h2 className="text-3xl font-bold mb-4">Join the marketplace</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Whether you execute work or fund it, YEILD is built so the verified outcome — not the loudest party — wins.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="bg-primary hover:bg-primary/90">
                  Become an Operator
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/brand-onboarding')}>
                  Fund Execution Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
};

export default About;
