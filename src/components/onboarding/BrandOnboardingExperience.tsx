import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, TrendingUp, Users, Star, Target, Zap, Crown, MessageSquare, Share2, Heart, DollarSign, Trophy } from 'lucide-react';

interface BrandOnboardingExperienceProps {
  onComplete?: () => void;
}

const BrandOnboardingExperience: React.FC<BrandOnboardingExperienceProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const mockBrandTestimonials = [
    { 
      brand: "TechFlow Solutions", 
      growth: "+287% engagement", 
      quote: "YIELD users delivered authentic content that drove real conversions. Our best marketing investment!", 
      ceo: "Sarah Chen, CMO",
      results: "15K new followers, 40% sales increase"
    },
    { 
      brand: "GreenLife Wellness", 
      growth: "+450% reach", 
      quote: "The community embraced our brand naturally. Organic growth we couldn't achieve elsewhere.", 
      ceo: "Marcus Rodriguez, Founder",
      results: "200K impressions, 60% brand awareness lift"
    },
    { 
      brand: "Urban Style Co.", 
      growth: "+320% sales", 
      quote: "YIELD users understand our audience better than traditional agencies. ROI was immediate.", 
      ceo: "Emily Watson, Marketing Director",
      results: "25K product sales, 5x ROAS"
    },
  ];

  const mockEngagementStats = [
    { metric: "Avg. Engagement Rate", value: "12.8%", trend: "+340% vs industry" },
    { metric: "Content Authenticity", value: "94%", trend: "User-generated content" },
    { metric: "Brand Sentiment", value: "96%", trend: "Positive reactions" },
    { metric: "Viral Potential", value: "8.2x", trend: "Higher reach than ads" },
  ];

  const steps = [
    {
      title: 'Welcome to Brand Success',
      subtitle: 'Where Authentic Marketing Thrives',
      description: 'Join 500+ brands that discovered the power of authentic user engagement. Your community-driven growth starts here.',
      icon: <Crown className="w-16 h-16 text-yellow-400" />,
      color: 'from-blue-600/30 via-purple-600/30 to-pink-500/30',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-blue-400 mb-2">500+ Brands</div>
            <div className="text-gray-300">Trust YIELD for authentic growth</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/20 rounded-lg text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">340%</div>
              <div className="text-sm text-gray-300">Avg. Growth Rate</div>
            </div>
            <div className="p-4 bg-purple-500/20 rounded-lg text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">15K+</div>
              <div className="text-sm text-gray-300">Active Creators</div>
            </div>
            <div className="p-4 bg-yellow-500/20 rounded-lg text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">4.9/5</div>
              <div className="text-sm text-gray-300">Brand Satisfaction</div>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-lg text-center">
              <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-400">5.2x</div>
              <div className="text-sm text-gray-300">Average ROAS</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'How YIELD Users Amplify Your Brand',
      subtitle: 'Authentic Stories, Real Results',
      description: 'Our community creates genuine content that resonates. No fake followers, no bot engagement - just real people who love sharing great brands.',
      icon: <Zap className="w-16 h-16 text-blue-400" />,
      color: 'from-cyan-600/30 via-blue-600/30 to-indigo-500/30',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-gray-300">Reviews</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <Share2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-xs text-gray-300">Social Posts</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <Heart className="w-6 h-6 text-pink-400 mx-auto mb-1" />
              <div className="text-xs text-gray-300">Testimonials</div>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xs text-gray-300">Campaigns</div>
            </div>
          </div>
          
          {mockEngagementStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div>
                <div className="font-semibold text-white">{stat.metric}</div>
                <div className="text-sm text-gray-400">{stat.trend}</div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'Brand Success Stories',
      subtitle: 'Real Brands, Real Growth',
      description: 'See how brands like yours achieved extraordinary results through authentic user engagement.',
      icon: <Trophy className="w-16 h-16 text-yellow-400" />,
      color: 'from-orange-600/30 via-yellow-600/30 to-amber-500/30',
      content: (
        <div className="space-y-6">
          {mockBrandTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-white">{testimonial.brand}</div>
                  <div className="text-sm text-gray-400">{testimonial.ceo}</div>
                </div>
                <Badge className="bg-green-500/20 text-green-300">{testimonial.growth}</Badge>
              </div>
              <p className="text-gray-300 text-sm italic mb-3">"{testimonial.quote}"</p>
              <div className="text-xs text-blue-400 font-medium">{testimonial.results}</div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: 'Your Brand Journey Begins',
      subtitle: 'Ready to Scale with Authenticity?',
      description: 'Create campaigns, track performance, and watch your brand grow through genuine community engagement.',
      icon: '🚀',
      color: 'from-purple-600/30 via-pink-600/30 to-rose-500/30',
      content: (
        <div className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
            <div className="text-4xl mb-4">🎯</div>
            <div className="font-bold text-white text-lg mb-2">Launch Your First Campaign</div>
            <div className="text-gray-300 text-sm">Set up your brand profile and create engaging tasks for our community</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-white text-sm">Real-time Analytics</div>
              <div className="text-xs text-gray-400">Track every interaction</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-white text-sm">Flexible Budgets</div>
              <div className="text-xs text-gray-400">Pay for results only</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-semibold text-white text-sm">Creative Control</div>
              <div className="text-xs text-gray-400">Approve all content</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-white text-sm">Growth Insights</div>
              <div className="text-xs text-gray-400">Optimize campaigns</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 z-50 overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className={`bg-gradient-to-br ${currentStepData.color} backdrop-blur-xl border-white/20 shadow-2xl`}>
                <CardContent className="p-8 lg:p-12">
                  {/* Progress indicators */}
                  <div className="flex justify-center mb-8">
                    {steps.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: index <= currentStep ? 1.2 : 0.8 }}
                        className={`w-3 h-3 rounded-full mx-2 transition-all duration-300 ${
                          index <= currentStep 
                            ? 'bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-400/50' 
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Content */}
                    <div className="text-center lg:text-left">
                      {/* Icon */}
                      <motion.div 
                        className="mb-6 flex justify-center lg:justify-start"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        {typeof currentStepData.icon === 'string' ? (
                          <div className="text-8xl">{currentStepData.icon}</div>
                        ) : (
                          currentStepData.icon
                        )}
                      </motion.div>

                      {/* Text Content */}
                      <motion.div 
                        className="space-y-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                          {currentStepData.title}
                        </h1>
                        <h2 className="text-xl lg:text-2xl text-blue-400 font-medium">
                          {currentStepData.subtitle}
                        </h2>
                        <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                          {currentStepData.description}
                        </p>
                      </motion.div>

                      {/* Actions */}
                      <motion.div 
                        className="flex gap-4 justify-center lg:justify-start"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          variant="outline"
                          onClick={handleSkip}
                          className="px-6 py-3 text-gray-300 border-gray-600 hover:bg-gray-800/50 backdrop-blur"
                        >
                          Skip
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25"
                        >
                          {currentStep === steps.length - 1 ? 'Launch Campaign' : 'Continue'}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </div>

                    {/* Right side - Interactive content */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="lg:max-h-96 overflow-y-auto custom-scrollbar"
                    >
                      {currentStepData.content}
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BrandOnboardingExperience;