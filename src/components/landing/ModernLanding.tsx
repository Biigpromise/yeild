import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { ArrowRight, Zap, Trophy, Users, Star, CheckCircle, TrendingUp, Building2, Megaphone, Coins, DollarSign, Target, HelpCircle, ChevronDown, Shield, Lock, Bird, Feather, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PayoutProof } from '@/components/engagement/PayoutProof';

export const ModernLanding: React.FC = () => {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);
  const features = [{
    icon: CheckCircle,
    title: 'Verified Execution',
    description: 'Every action is reviewed and verified before rewards are released',
    color: 'text-yellow-600 bg-yellow-500/10'
  }, {
    icon: Trophy,
    title: 'Operator Ranks',
    description: 'Build a trusted track record and unlock higher-value assignments',
    color: 'text-green-600 bg-green-500/10'
  }, {
    icon: Users,
    title: 'Real People, Real Results',
    description: 'A vetted operator network delivering measurable outcomes for brands',
    color: 'text-blue-600 bg-blue-500/10'
  }];
  const stats = [{
    number: '10K+',
    label: 'Verified Operators'
  }, {
    number: '500+',
    label: 'Brands'
  }, {
    number: '₦2M+',
    label: 'Credits Paid'
  }];
  const benefits = ['Quick Execution Orders that take minutes', 'Instant Credit rewards (1 Credit = ₦1)', 'Paystack & Paystack withdrawals', '7-day escrow protection on every payout', 'Operator ranks: Dove → Eagle → Phoenix', 'Sole verification authority — fair to Operators'];
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <YieldLogo size={32} />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              YEILD
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')} size="sm" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - BRAND FIRST */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: animated ? 1 : 0,
            y: animated ? 0 : 20
          }} transition={{
            duration: 0.6
          }} className="mb-8">
              <YieldLogo size={80} className="mx-auto mb-6" />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary uppercase tracking-wider">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified Work · Guaranteed Outcomes
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                Professional Execution<br />
                Marketplace.<br />
                <span className="text-primary">Verified by YEILD.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                Brands fund Execution Orders upfront. Verified Operators deliver real-world work. YEILD holds sole verification authority — so payouts are fair, fast, and proof-backed.
              </p>
              <p className="text-sm text-muted-foreground/80 mb-8 max-w-xl mx-auto">
                1 Credit = ₦1 · 7-day escrow protection · Paystack & Paystack payouts
              </p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: animated ? 1 : 0,
            y: animated ? 0 : 20
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button variant="brand" size="lg" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold group">
                <Building2 className="mr-2 h-5 w-5" />
                Deploy an Execution Order
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth?mode=signup&type=user')} className="h-14 px-8 text-lg font-semibold">
                <Coins className="mr-2 h-5 w-5" />
                Become an Operator
              </Button>
            </motion.div>

            {/* Stats - Brand focused */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: animated ? 1 : 0,
            y: animated ? 0 : 20
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground">Brands</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground">Verified Operators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">Execution Success</div>
              </div>
            </motion.div>
          </div>
         </section>

         {/* For Brands Section - MOVED UP */}
         <section className="py-16 lg:py-24 bg-muted/30">
           <div className="container mx-auto px-4">
             <motion.div initial={{
             opacity: 0,
             y: 20
           }} whileInView={{
             opacity: 1,
             y: 0
           }} viewport={{
             once: true
           }} transition={{
             duration: 0.6
           }} className="text-center mb-16">
               <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                 Why Brands Choose YEILD
               </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get measurable, real-world outcomes from a vetted Operator network — whether you need 10,000 app testers, on-the-ground product visits, or verified user actions.
                </p>
              </motion.div>

             <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
               {[{
               icon: Target,
              title: 'Reach Verified Operators',
                description: 'Connect with verified operators who are ready to execute your brand campaigns',
                color: 'text-blue-600 bg-blue-500/10'
             }, {
               icon: TrendingUp,
              title: 'Track Executions',
                description: 'Get real-time analytics and detailed insights on execution order performance and ROI',
                color: 'text-purple-600 bg-purple-500/10'
             }, {
               icon: DollarSign,
              title: 'Flexible Execution Orders',
                description: 'Set your own budget, choose execution modes, and customize order requirements to match your needs',
                color: 'text-green-600 bg-green-500/10'
             }].map((feature, index) => {
               const Icon = feature.icon;
               return <motion.div key={index} initial={{
                 opacity: 0,
                 y: 20
               }} whileInView={{
                 opacity: 1,
                 y: 0
               }} viewport={{
                 once: true
               }} transition={{
                 duration: 0.6,
                 delay: index * 0.1
               }}>
                     <Card className="text-center p-6 h-full border-border/60 hover:shadow-lg transition-shadow">
                       <CardContent className="p-6">
                         <div className={`w-16 h-16 rounded-2xl ${feature.color} mx-auto mb-6 flex items-center justify-center`}>
                           <Icon className="h-8 w-8" />
                         </div>
                         <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                         <p className="text-muted-foreground leading-relaxed">
                           {feature.description}
                         </p>
                       </CardContent>
                     </Card>
                   </motion.div>;
             })}
             </div>

             <motion.div initial={{
             opacity: 0,
             y: 20
           }} whileInView={{
             opacity: 1,
             y: 0
           }} viewport={{
             once: true
           }} transition={{
             duration: 0.6,
             delay: 0.4
           }} className="text-center">
               <Button size="lg" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group">
                 <Megaphone className="mr-2 h-5 w-5" />
                 Start Your Campaign
                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
               </Button>
             </motion.div>
           </div>
         </section>

         {/* Audience Section - Who is YEILD for */}
         <section className="container mx-auto px-4 py-16">
           <motion.div initial={{
           opacity: 0,
           y: 20
         }} whileInView={{
           opacity: 1,
           y: 0
         }} viewport={{
           once: true
         }} transition={{
           duration: 0.6
         }} className="max-w-5xl mx-auto">
             <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-center">
               Who is YEILD for?
             </h2>
             <div className="grid gap-6 md:grid-cols-2">
               <Card className="border-border/60 hover:shadow-lg transition-shadow border-2 border-primary/20">
                 <CardContent className="p-6 flex flex-col h-full">
                     <div className="flex items-center gap-3 mb-4">
                       <Building2 className="h-6 w-6 text-primary" />
                       <span className="text-lg font-semibold">I&apos;m a Brand</span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-4">
                       Need real humans to test, visit, review, or take action? Deploy a campaign and tap into a verified Operator network.
                     </p>
                     <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                       <li>• App testing, product trials, field visits</li>
                       <li>• Verified proof of every completed action</li>
                       <li>• Real-time campaign tracking and reporting</li>
                     </ul>
                    <Button variant="brand" size="sm" className="mt-auto self-start" onClick={() => navigate('/auth?mode=signup&type=brand')}>
                      Deploy a campaign
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/60 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                     <div className="flex items-center gap-3 mb-4">
                       <Coins className="h-6 w-6 text-primary" />
                       <span className="text-lg font-semibold">I&apos;m an Operator</span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-4">
                       Join YEILD&apos;s Operator network. Carry out verified real-world actions for trusted brands and get paid for proven work.
                     </p>
                     <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                       <li>• Real assignments from real brands</li>
                       <li>• Transparent payouts on verified work</li>
                       <li>• Build your operator rank and reputation</li>
                     </ul>
                    <Button size="sm" className="mt-auto self-start" onClick={() => navigate('/auth?mode=signup&type=user')}>
                      Join as Operator
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </CardContent>
               </Card>
             </div>
           </motion.div>
         </section>

         {/* Operator Ranks Progression */}
         <section className="py-16 lg:py-24 bg-muted/30">
           <div className="container mx-auto px-4">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="text-center mb-12 max-w-3xl mx-auto"
             >
               <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary uppercase tracking-wider">
                 <Trophy className="h-3.5 w-3.5" />
                 Operator Career Path
               </div>
               <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                 Earn Your Rank. Unlock Higher-Value Orders.
               </h2>
               <p className="text-lg text-muted-foreground">
                 Every Operator starts as a Dove and rises through verified work. Higher ranks unlock larger Orders, Field-mode assignments, and priority payouts. Fraud or rejected proofs trigger rank decay — keeping the network clean.
               </p>
             </motion.div>

             <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
               {[
                 { name: 'Dove', icon: Feather, tier: 'Entry', perks: 'Digital Orders only', color: 'from-slate-400/20 to-slate-500/10', accent: 'text-slate-400' },
                 { name: 'Hawk', icon: Bird, tier: 'Verified', perks: 'Higher Order limits', color: 'from-blue-400/20 to-blue-500/10', accent: 'text-blue-400' },
                 { name: 'Eagle', icon: Bird, tier: 'Trusted', perks: 'Field-mode unlocked', color: 'from-amber-400/20 to-amber-500/10', accent: 'text-amber-500' },
                 { name: 'Falcon', icon: Bird, tier: 'Elite', perks: 'Priority + premium Orders', color: 'from-orange-500/20 to-red-500/10', accent: 'text-orange-500' },
                 { name: 'Phoenix', icon: Flame, tier: 'Top 1%', perks: 'Max payouts, fastest review', color: 'from-primary/30 to-primary/10', accent: 'text-primary' },
               ].map((rank, i) => {
                 const Icon = rank.icon;
                 return (
                   <motion.div
                     key={rank.name}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.4, delay: i * 0.08 }}
                   >
                     <Card className={`h-full border-border/60 bg-gradient-to-br ${rank.color} hover:shadow-lg transition-shadow`}>
                       <CardContent className="p-5 text-center">
                         <Icon className={`h-8 w-8 mx-auto mb-3 ${rank.accent}`} />
                         <div className="font-bold text-lg">{rank.name}</div>
                         <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{rank.tier}</div>
                         <p className="text-xs text-muted-foreground">{rank.perks}</p>
                       </CardContent>
                     </Card>
                   </motion.div>
                 );
               })}
             </div>

             <div className="text-center mt-10">
               <Button variant="outline" size="lg" onClick={() => navigate('/operator-ranks')} className="gap-2">
                 See full rank progression
                 <ArrowRight className="h-4 w-4" />
               </Button>
             </div>
           </div>
         </section>

         {/* NGN Economy + Escrow Trust */}
         <section className="py-16 lg:py-24">
           <div className="container mx-auto px-4">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="text-center mb-12 max-w-3xl mx-auto"
             >
               <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-semibold text-green-600 uppercase tracking-wider">
                 <Shield className="h-3.5 w-3.5" />
                 Money You Can Trust
               </div>
               <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                 Real Naira. Real Escrow. Real Payouts.
               </h2>
               <p className="text-lg text-muted-foreground">
                 Credits aren&apos;t points. They&apos;re your money — held safely in escrow until verified, then withdrawn straight to your Nigerian bank.
               </p>
             </motion.div>

             <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
               <Card className="border-border/60 hover:shadow-lg transition-shadow">
                 <CardContent className="p-6 text-center">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                     <Coins className="h-7 w-7 text-primary" />
                   </div>
                   <div className="text-2xl font-bold mb-1">1 Credit = ₦1</div>
                   <p className="text-sm text-muted-foreground">
                     Transparent NGN-pegged value. What you earn is what you withdraw — no hidden conversions.
                   </p>
                 </CardContent>
               </Card>

               <Card className="border-border/60 hover:shadow-lg transition-shadow">
                 <CardContent className="p-6 text-center">
                   <div className="w-14 h-14 rounded-2xl bg-green-500/10 mx-auto mb-4 flex items-center justify-center">
                     <Lock className="h-7 w-7 text-green-600" />
                   </div>
                   <div className="text-2xl font-bold mb-1">7-Day Escrow</div>
                   <p className="text-sm text-muted-foreground">
                     Brands fund Orders upfront. Earnings sit in escrow for 7 days, then unlock for withdrawal — protected on both sides.
                   </p>
                 </CardContent>
               </Card>

               <Card className="border-border/60 hover:shadow-lg transition-shadow">
                 <CardContent className="p-6 text-center">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 mx-auto mb-4 flex items-center justify-center">
                     <DollarSign className="h-7 w-7 text-blue-600" />
                   </div>
                   <div className="text-2xl font-bold mb-1">Direct Bank Payouts</div>
                   <p className="text-sm text-muted-foreground">
                     Withdraw via Paystack or Paystack once you hit 1,000 Credits. Money lands in your bank — no third-party wallets.
                   </p>
                 </CardContent>
               </Card>
             </div>

             <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="flex flex-col items-center gap-4"
             >
               <p className="text-xs uppercase tracking-wider text-muted-foreground">Powered by trusted payment rails</p>
               <div className="flex flex-wrap items-center justify-center gap-8">
                 <div className="px-6 py-3 rounded-lg bg-card border border-border/60 font-bold text-lg">
                   <span className="text-blue-600">Pay</span>stack
                 </div>
                 <div className="px-6 py-3 rounded-lg bg-card border border-border/60 font-bold text-lg">
                   <span className="text-orange-500">Flutter</span>wave
                 </div>
               </div>
             </motion.div>
           </div>
         </section>

         {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                How YEILD Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Brands fund Execution Orders. Verified Operators deliver. YEILD is the sole authority that approves proof before credits are released — protecting both sides.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => {
              const Icon = feature.icon;
              return <motion.div key={index} initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.6,
                delay: index * 0.1
              }}>
                    <Card className="text-center p-6 h-full border-border/60 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 rounded-2xl ${feature.color} mx-auto mb-6 flex items-center justify-center`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>;
            })}
            </div>
          </div>
        </section>

        {/* For Brands Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }} className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Grow Your Brand with YEILD
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Drive measurable, real-world outcomes from a vetted Operator network. Launch and manage Execution Orders in minutes — pay only for verified work.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {[{
              icon: Target,
              title: 'Reach Verified Operators',
              description: 'Match with ranked Operators ready to execute your Order — from Dove (entry) to Phoenix (top 1%).',
              color: 'text-blue-600 bg-blue-500/10'
            }, {
              icon: TrendingUp,
              title: 'Track Every Execution',
              description: 'Real-time analytics and proof-backed insights on every Execution Order and ROI.',
              color: 'text-purple-600 bg-purple-500/10'
            }, {
              icon: DollarSign,
              title: 'Upfront-Funded Orders',
              description: 'Set your budget, choose execution mode, and fund Orders upfront. Operator payouts sit in 7-day escrow.',
              color: 'text-green-600 bg-green-500/10'
            }].map((feature, index) => {
              const Icon = feature.icon;
              return <motion.div key={index} initial={{
                opacity: 0,
                y: 20
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.6,
                delay: index * 0.1
              }}>
                    <Card className="text-center p-6 h-full border-border/60 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 rounded-2xl ${feature.color} mx-auto mb-6 flex items-center justify-center`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>;
            })}
            </div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="text-center">
              <Button size="lg" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group">
                <Megaphone className="mr-2 h-5 w-5" />
                Deploy an Execution Order
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Why Choose YEILD?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We've designed YEILD as the most professional and trusted platform for executing Orders and earning Credits — verified, escrowed, and paid in NGN.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  x: -20
                }} whileInView={{
                  opacity: 1,
                  x: 0
                }} viewport={{
                  once: true
                }} transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.div>)}
                </div>

                <div className="mt-8">
                  <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="bg-primary hover:bg-primary/90">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              <motion.div initial={{
              opacity: 0,
              x: 20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="relative">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-0">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 text-primary mx-auto mb-6" />
                      <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
                      <p className="text-muted-foreground mb-6">
                        Join our community and start executing orders today. It only takes 2 minutes to get started.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-background rounded-lg p-4">
                          <div className="text-xl font-bold text-primary">2 min</div>
                          <div className="text-xs text-muted-foreground">Setup Time</div>
                        </div>
                        <div className="bg-background rounded-lg p-4">
                          <div className="text-xl font-bold text-green-600">24/7</div>
                          <div className="text-xs text-muted-foreground">Support</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Payout Proof Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-lg mx-auto"
            >
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-center">
                Real Payouts to Real Operators
              </h2>
              <PayoutProof />
            </motion.div>
          </div>
        </section>

        {/* Compact FAQ Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Got questions? We've got answers.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: 'How do I earn Credits on YEILD?',
                  answer: 'Complete Execution Orders from verified brands — app testing, field visits, content actions, and more. Each approved Order rewards you with Credits (1 Credit = ₦1) that you can withdraw to your bank.'
                },
                {
                  question: 'How do I withdraw my earnings?',
                  answer: 'Once you hit the 1,000 Credit minimum, request a payout via Paystack or Paystack. Earnings clear a 7-day escrow hold and are then transferred directly to your Nigerian bank account.'
                },
                {
                  question: 'Is YEILD free for Operators?',
                  answer: 'Yes. Operators never pay to join. You earn Credits by executing real Orders that brands have already funded upfront.'
                },
                {
                  question: 'How do brands create Execution Orders?',
                  answer: 'Brands sign up, get vetted, fund their wallet, and deploy Execution Orders using YEILD templates. YEILD (not the brand) verifies every proof — protecting Operators from unfair rejections.'
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="border-border/60">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-8"
            >
              <Button
                variant="outline"
                onClick={() => navigate('/faq')}
                className="gap-2"
              >
                View All FAQs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Start Executing?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of verified Operators already earning real NGN with YEILD.
                Sign up, get verified, and start executing in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth?mode=signup&type=user')} className="h-14 px-8 text-lg font-semibold">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Executing Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="brand" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Deploy an Execution Order
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <YieldLogo size={24} />
              <span className="font-semibold">YEILD</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/faq')} className="hover:text-foreground transition-colors">FAQ</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacy Policy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};