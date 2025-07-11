import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Upload, DollarSign, Trophy, Users, Star } from 'lucide-react';

const YieldGuideSection = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your account in seconds and join the YEILD community"
    },
    {
      icon: Search,
      title: "Pick a Task",
      description: "Browse available tasks from top brands and choose what interests you"
    },
    {
      icon: Upload,
      title: "Submit Proof",
      description: "Complete the task and upload your proof to get verified"
    },
    {
      icon: DollarSign,
      title: "Earn Instantly",
      description: "Get paid immediately upon approval - cash out or keep earning!"
    }
  ];

  const birdLevels = [
    { name: "Dove", referrals: 5, color: "text-gray-400", bgColor: "bg-gray-100" },
    { name: "Hawk", referrals: 20, color: "text-blue-400", bgColor: "bg-blue-100" },
    { name: "Eagle", referrals: 100, color: "text-green-400", bgColor: "bg-green-100" },
    { name: "Falcon", referrals: 500, color: "text-purple-400", bgColor: "bg-purple-100" },
    { name: "Phoenix", referrals: 1000, color: "text-yeild-yellow", bgColor: "bg-yellow-100" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      earnings: "$2,847",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "I've earned over $2,800 in just 3 months! Tasks are simple and payments are instant."
    },
    {
      name: "Mike D.",
      earnings: "$1,923",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "Perfect side hustle. I complete tasks during my commute and earn extra income."
    },
    {
      name: "Lisa K.",
      earnings: "$3,456",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "The referral system is amazing! I've built a network and earn passive income."
    }
  ];

  return (
    <div className="bg-black text-white">
      {/* How YEILD Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              How <span className="text-yeild-yellow">YEILD</span> Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start earning money in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-yeild-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-black" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bird Progression System */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              The More You Refer, The Higher You <span className="text-yeild-yellow">Fly</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlock exclusive rewards and benefits as you build your referral network
            </p>
          </motion.div>

          <div className="relative">
            {/* Desktop horizontal scroll */}
            <div className="hidden lg:flex items-center justify-center space-x-8 overflow-x-auto pb-8">
              {birdLevels.map((bird, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 text-center group cursor-pointer"
                >
                  <div className={`w-32 h-32 mx-auto ${bird.bgColor} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Trophy className={`w-16 h-16 ${bird.color}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${bird.color} mb-2`}>{bird.name}</h3>
                  <p className="text-gray-400">{bird.referrals}+ referrals</p>
                </motion.div>
              ))}
            </div>

            {/* Mobile grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-6">
              {birdLevels.map((bird, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group cursor-pointer"
                >
                  <div className={`w-20 h-20 mx-auto ${bird.bgColor} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Trophy className={`w-10 h-10 ${bird.color}`} />
                  </div>
                  <h3 className={`text-lg font-bold ${bird.color} mb-1`}>{bird.name}</h3>
                  <p className="text-gray-400 text-sm">{bird.referrals}+</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community & Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">
              Join Thousands of <span className="text-yeild-yellow">YEILDERS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Real people earning real money every day
            </p>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <div className="text-center p-6 bg-gray-900 rounded-2xl">
              <div className="text-4xl font-bold text-yeild-yellow mb-2">47,832</div>
              <div className="text-gray-400">Tasks Completed Today</div>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-2xl">
              <div className="text-4xl font-bold text-yeild-yellow mb-2">125K+</div>
              <div className="text-gray-400">Total YEILDERS</div>
            </div>
            <div className="text-center p-6 bg-gray-900 rounded-2xl">
              <div className="text-4xl font-bold text-yeild-yellow mb-2">387</div>
              <div className="text-gray-400">Brands Onboard</div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-900 p-6 rounded-2xl text-center"
              >
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-2">{testimonial.name}</h3>
                <div className="text-yeild-yellow font-bold text-lg mb-4">
                  Earned {testimonial.earnings}
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yeild-yellow fill-current" />
                  ))}
                </div>
                <p className="text-gray-400 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default YieldGuideSection;