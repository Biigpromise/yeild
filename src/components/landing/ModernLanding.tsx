import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { ArrowRight, Zap, Trophy, Users, Star, CheckCircle, TrendingUp, Building2, Megaphone, Coins, DollarSign, Target, HelpCircle, ChevronDown } from 'lucide-react';
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
    icon: Zap,
    title: 'Earn Points',
    description: 'Complete simple tasks and earn points instantly',
    color: 'text-yellow-600 bg-yellow-500/10'
  }, {
    icon: Trophy,
    title: 'Level Up',
    description: 'Progress through levels and unlock new opportunities',
    color: 'text-green-600 bg-green-500/10'
  }, {
    icon: Users,
    title: 'Refer Friends',
    description: 'Invite friends and earn bonus points together',
    color: 'text-blue-600 bg-blue-500/10'
  }];
  const stats = [{
    number: '10K+',
    label: 'Active Users'
  }, {
    number: '500+',
    label: 'Brands'
  }, {
    number: '₦2M+',
    label: 'Rewards Paid'
  }];
  const benefits = ['Simple tasks that take just minutes', 'Instant point rewards', 'Multiple withdrawal options', 'Referral bonus program', 'Level-based perks', 'Real-time progress tracking'];
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
        {/* Hero Section */}
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
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">Earn Rewards As a User.
Grow Your Brand With Targeted Campaigns.
All In One Platform.<br />
                Grow your brand with targeted campaigns.<br />
                All in one platform.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                YEILD connects users who want to earn with brands who want targeted engagement, on a simple and powerful platform.
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
          }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/auth?mode=signup&type=user')} className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group">
                <Coins className="mr-2 h-5 w-5" />
                Start Earning Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="brand" size="lg" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold">
                <Building2 className="mr-2 h-5 w-5" />
                Start Advertising Today
              </Button>
            </motion.div>

            {/* Stats */}
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
              {stats.map((stat, index) => <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>)}
            </motion.div>
          </div>
         </section>

         {/* Audience Section */}
         <section className="container mx-auto px-4 pb-16">
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
               <Card className="border-border/60 hover:shadow-lg transition-shadow">
                 <CardContent className="p-6 flex flex-col h-full">
                   <div className="flex items-center gap-3 mb-4">
                     <Coins className="h-6 w-6 text-primary" />
                     <span className="text-lg font-semibold">I&apos;m here to earn</span>
                   </div>
                   <p className="text-sm text-muted-foreground mb-4">
                     Complete simple tasks, earn points, unlock bird levels, and withdraw your rewards securely.
                   </p>
                   <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                     <li>• Short, mobile-friendly tasks</li>
                     <li>• Transparent points and rewards</li>
                     <li>• Referral bonuses for inviting friends</li>
                   </ul>
                   <Button size="sm" className="mt-auto self-start" onClick={() => navigate('/auth?mode=signup&type=user')}>
                     Start earning
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                 </CardContent>
               </Card>

               <Card className="border-border/60 hover:shadow-lg transition-shadow">
                 <CardContent className="p-6 flex flex-col h-full">
                   <div className="flex items-center gap-3 mb-4">
                     <Building2 className="h-6 w-6 text-primary" />
                     <span className="text-lg font-semibold">I&apos;m here to advertise</span>
                   </div>
                   <p className="text-sm text-muted-foreground mb-4">
                     Launch campaigns that put your brand in front of verified, reward-motivated users.
                   </p>
                   <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                     <li>• Create and fund campaigns in minutes</li>
                     <li>• Reach targeted users at scale</li>
                     <li>• Monitor performance with real-time insights</li>
                   </ul>
                   <Button variant="brand" size="sm" className="mt-auto self-start" onClick={() => navigate('/auth?mode=signup&type=brand')}>
                     Start advertising
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                 </CardContent>
               </Card>
             </div>
           </motion.div>
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
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Getting started with YEILD is simple. Follow these easy steps to start earning.
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
                Drive awareness, engagement, and real actions from verified users. Launch and manage campaigns in minutes.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {[{
              icon: Target,
              title: 'Reach Targeted Users',
              description: 'Connect with engaged users who are ready to interact with your brand and complete your campaigns',
              color: 'text-blue-600 bg-blue-500/10'
            }, {
              icon: TrendingUp,
              title: 'Track Performance',
              description: 'Get real-time analytics and detailed insights on your campaign performance and ROI',
              color: 'text-purple-600 bg-purple-500/10'
            }, {
              icon: DollarSign,
              title: 'Flexible Campaigns',
              description: 'Set your own budget, choose your target audience, and customize campaign goals to match your needs',
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
                Start Advertising Today
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
                  We've designed YEILD to be the most user-friendly and rewarding platform for completing tasks and earning points.
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
                        Join our community and start earning points today. It only takes 2 minutes to get started.
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
                Real Payouts, Real Users
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
                  question: 'How do I earn points on YEILD?',
                  answer: 'Complete simple tasks like following social accounts, engaging with content, or referring friends. Each completed task rewards you with points that can be withdrawn as cash.'
                },
                {
                  question: 'How do I withdraw my earnings?',
                  answer: 'Once you reach the minimum withdrawal threshold, you can request a payout directly to your bank account. Withdrawals are typically processed within 24-48 hours.'
                },
                {
                  question: 'Is YEILD free to use?',
                  answer: 'Yes! YEILD is completely free for users. You earn real points by completing tasks without any upfront cost.'
                },
                {
                  question: 'How do brands create campaigns?',
                  answer: 'Brands can sign up, fund their wallet, and create campaigns with targeted requirements. Our platform matches campaigns with suitable users for maximum engagement.'
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
                Ready to Start Earning?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of satisfied users who are already earning with YEILD. 
                Sign up now and get started in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth?mode=signup&type=user')} className="h-14 px-8 text-lg font-semibold">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Earning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="brand" onClick={() => navigate('/auth?mode=signup&type=brand')} className="h-14 px-8 text-lg font-semibold">
                  <Megaphone className="mr-2 h-5 w-5" />
                  Start Advertising Today
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