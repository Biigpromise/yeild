import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { YieldLogo } from '@/components/ui/YieldLogo';
import { 
  ArrowRight, 
  Zap, 
  Trophy, 
  Users, 
  Star,
  CheckCircle,
  TrendingUp,
  Building2,
  Megaphone,
  Coins,
  DollarSign,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ModernLanding: React.FC = () => {
  const navigate = useNavigate();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Zap,
      title: 'Earn Points',
      description: 'Complete simple tasks and earn points instantly',
      color: 'text-yellow-600 bg-yellow-500/10'
    },
    {
      icon: Trophy,
      title: 'Level Up',
      description: 'Progress through levels and unlock new opportunities',
      color: 'text-green-600 bg-green-500/10'
    },
    {
      icon: Users,
      title: 'Refer Friends',
      description: 'Invite friends and earn bonus points together',
      color: 'text-blue-600 bg-blue-500/10'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '500+', label: 'Brands' },
    { number: '₦2M+', label: 'Rewards Paid' }
  ];

  const benefits = [
    'Simple tasks that take just minutes',
    'Instant point rewards',
    'Multiple withdrawal options',
    'Referral bonus program',
    'Level-based perks',
    'Real-time progress tracking'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-sm"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth?mode=signup')}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animated ? 1 : 0, y: animated ? 0 : 20 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <YieldLogo size={80} className="mx-auto mb-6" />
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                Earn Points.<br />
                Complete Tasks.<br />
                Get Rewarded.
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users earning real rewards or grow your brand with targeted campaigns. 
                Start with YEILD's user-friendly platform today.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animated ? 1 : 0, y: animated ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth?mode=signup&type=user')}
                className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group"
              >
                <Coins className="mr-2 h-5 w-5" />
                Start Earning Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="brand" 
                size="lg"
                onClick={() => navigate('/auth?mode=signup&type=brand')}
                className="h-14 px-8 text-lg font-semibold"
              >
                <Building2 className="mr-2 h-5 w-5" />
                Start Advertising Today
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animated ? 1 : 0, y: animated ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
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
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
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
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* For Brands Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Grow Your Brand with YEILD
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Reach thousands of engaged users ready to interact with your brand. Launch campaigns in minutes.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
              {[
                {
                  icon: Target,
                  title: 'Reach Targeted Users',
                  description: 'Connect with engaged users who are ready to interact with your brand and complete your campaigns',
                  color: 'text-blue-600 bg-blue-500/10'
                },
                {
                  icon: TrendingUp,
                  title: 'Track Performance',
                  description: 'Get real-time analytics and detailed insights on your campaign performance and ROI',
                  color: 'text-purple-600 bg-purple-500/10'
                },
                {
                  icon: DollarSign,
                  title: 'Flexible Campaigns',
                  description: 'Set your own budget, choose your target audience, and customize campaign goals to match your needs',
                  color: 'text-green-600 bg-green-500/10'
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
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
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Button 
                size="lg"
                onClick={() => navigate('/auth?mode=signup&type=brand')}
                className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 group"
              >
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  Why Choose YEILD?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We've designed YEILD to be the most user-friendly and rewarding platform for completing tasks and earning points.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth?mode=signup')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
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

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Start Earning?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of satisfied users who are already earning with YEILD. 
                Sign up now and get started in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/auth?mode=signup&type=user')}
                  className="h-14 px-8 text-lg font-semibold"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Earning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="brand"
                  onClick={() => navigate('/auth?mode=signup&type=brand')}
                  className="h-14 px-8 text-lg font-semibold"
                >
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
              <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
              <button onClick={() => navigate('/terms')}>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};