import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, Award, Star, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock data for testimonials and task examples
const testimonials = [
  {
    name: "Alex Johnson",
    role: "Regular Yielder",
    testimonial: "I've earned over $500 in my spare time completing tasks on YEILD. The platform is super easy to use!",
    image: "https://i.pravatar.cc/150?img=2"
  },
  {
    name: "Sarah Williams",
    role: "Power Yielder",
    testimonial: "YEILD has become my go-to for extra income. The tasks are interesting and the rewards are excellent.",
    image: "https://i.pravatar.cc/150?img=5"
  },
  {
    name: "Michael Chen",
    role: "Brand Partner",
    testimonial: "As a brand, the quality of user engagement on YEILD has been outstanding. Great ROI on our campaigns!",
    image: "https://i.pravatar.cc/150?img=8"
  }
];

const taskExamples = [
  {
    title: "Survey Completion",
    reward: "50-200 points",
    time: "5-15 mins",
    icon: "🔍"
  },
  {
    title: "App Testing",
    reward: "100-500 points",
    time: "10-30 mins",
    icon: "📱"
  },
  {
    title: "Content Creation",
    reward: "200-1000 points",
    time: "30-60 mins",
    icon: "🎨"
  },
  {
    title: "Product Reviews",
    reward: "150-300 points",
    time: "15-20 mins",
    icon: "⭐"
  }
];

const Index = () => {
  const navigate = useNavigate();

  // Simulate a logged-in user (replace with actual auth check)
  const isLoggedIn = localStorage.getItem("yeild-user") !== null;

  // Scroll to section on button click
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with enhanced styling */}
      <header className="relative bg-yeild-black overflow-hidden">
        {/* Enhanced Yellow accent graphics with more dynamic shapes */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-yeild-yellow rounded-full opacity-20 blur-3xl animate-pulse-subtle"></div>
        <div className="absolute top-40 right-10 w-80 h-80 bg-yeild-yellow/30 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-yeild-yellow/20 rounded-full opacity-10 blur-3xl"></div>
        
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <span className="text-yeild-yellow text-3xl font-bold tracking-tight">YEILD</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#how-it-works" className="text-white hover:text-yeild-yellow transition-colors duration-300 font-medium">How It Works</a>
            <a href="#for-brands" className="text-white hover:text-yeild-yellow transition-colors duration-300 font-medium">For Brands</a>
            <a href="#testimonials" className="text-white hover:text-yeild-yellow transition-colors duration-300 font-medium">Testimonials</a>
          </div>
          <div className="flex space-x-4">
            {isLoggedIn ? (
              <Button 
                className="yeild-btn-primary"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="yeild-btn-secondary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button 
                  className="yeild-btn-primary"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 md:py-28">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <div className="relative bg-yeild-black p-6 rounded-xl">
                {/* YEILD Logo Box - Simplified with no fancy animations */}
                <div className="flex flex-col items-center justify-center bg-black p-8 rounded-xl border border-gray-800">
                  <img 
                    src="/lovable-uploads/383ca0f4-918c-4ce3-a2e1-e7cd12b0f420.png" 
                    alt="YEILD Logo" 
                    className="w-32 h-32 mb-4" 
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <Button 
                  className="yeild-btn-primary text-lg group"
                  onClick={() => navigate("/signup")}
                >
                  Start Earning Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="yeild-btn-secondary text-lg"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  Learn More
                </Button>
              </div>
              
              <div className="flex items-center mt-10 gap-4 bg-gray-900/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800 max-w-sm">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-yeild-black overflow-hidden ring-2 ring-yeild-yellow/30">
                      <img 
                        src={`https://i.pravatar.cc/150?img=${i+10}`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-gray-300 font-medium">
                  <span className="text-yeild-yellow font-bold">5,000+</span> users this month
                </span>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-yeild-yellow/30 blur-xl rounded-full"></div>
                <div className="yeild-card relative backdrop-blur-sm border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500">
                  {/* Task card decorative elements */}
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-yeild-yellow rounded-full"></div>
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-yeild-yellow/70 rounded-full"></div>
                  
                  <div className="font-semibold text-yeild-yellow mb-2">Popular Task</div>
                  <h3 className="text-xl font-bold mb-3">Website User Testing</h3>
                  <div className="flex items-center mb-4">
                    <div className="bg-yeild-yellow/20 text-yeild-yellow px-3 py-1 rounded-full text-sm font-medium">
                      500 points
                    </div>
                    <div className="ml-3 text-gray-400 text-sm">Est. 15 minutes</div>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Test our new e-commerce website and provide detailed feedback on the checkout flow.
                  </p>
                  <Button className="w-full yeild-btn-primary group">
                    Accept Task
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="absolute -right-4 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                  <div className="text-yeild-yellow font-bold">$25.00</div>
                  <div className="text-xs text-gray-400">Earned Today</div>
                </div>
                
                <div className="absolute -left-4 bottom-0 transform -translate-x-1/2 translate-y-1/2 bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-lg backdrop-blur-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yeild-yellow" />
                    <span className="ml-1 font-bold">Level 5</span>
                  </div>
                  <div className="text-xs text-gray-400">Power Yielder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works - Enhanced with cards and better visuals */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-gray-950 to-yeild-black relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yeild-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yeild-yellow/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-yeild-yellow/10 rounded-full text-yeild-yellow text-sm font-semibold mb-3">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              How <span className="text-yeild-yellow">YEILD</span> Works
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yeild-yellow rounded-full"></div>
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto">Our platform makes earning rewards simple and accessible to everyone.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-16 h-16 bg-yeild-yellow/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-yeild-yellow text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yeild-yellow transition-colors">Sign Up</h3>
                <p className="text-gray-300">
                  Create your free account in less than a minute. No credit card required.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 relative overflow-hidden group transform md:translate-y-4">
              <div className="absolute -right-8 -top-8 w-16 h-16 bg-yeild-yellow/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-yeild-yellow text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yeild-yellow transition-colors">Complete Tasks</h3>
                <p className="text-gray-300">
                  Choose from hundreds of available tasks that match your skills and interests.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-16 h-16 bg-yeild-yellow/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <CardContent className="p-6">
                <div className="w-14 h-14 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-yeild-yellow text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-yeild-yellow transition-colors">Get Paid</h3>
                <p className="text-gray-300">
                  Earn points for every completed task and convert them to cash or gift cards.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Available Task Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {taskExamples.map((task, index) => (
                <Card key={index} className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-3">{task.icon}</div>
                    <h4 className="text-lg font-bold mb-2">{task.title}</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <div className="bg-yeild-yellow/20 text-yeild-yellow px-3 py-1 rounded-full text-xs font-medium">
                        {task.reward}
                      </div>
                      <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs">
                        {task.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              className="yeild-btn-primary text-lg group"
              onClick={() => navigate("/signup")}
            >
              Join YEILD Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Brands Section - Enhanced with better visuals */}
      <section id="for-brands" className="py-16 md:py-24 relative overflow-hidden">
        {/* Enhanced Yellow accent graphics */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yeild-yellow rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-yeild-yellow/15 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2">
              <span className="inline-block px-4 py-1 bg-yeild-yellow/20 rounded-full text-yeild-yellow text-sm font-semibold mb-3">FOR BRANDS</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Connect with engaged users ready to interact with your brand
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Partner with YEILD to create custom tasks that drive meaningful engagement with your target audience. Our platform helps you:
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mt-1 mr-4 w-10 h-10 rounded-full bg-yeild-yellow/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-yeild-yellow h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Gather valuable user feedback</h4>
                    <p className="text-gray-400">Get real insights from real users to improve your products.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-4 w-10 h-10 rounded-full bg-yeild-yellow/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-yeild-yellow h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Boost app installations and reviews</h4>
                    <p className="text-gray-400">Increase your app's visibility and credibility through organic growth.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mt-1 mr-4 w-10 h-10 rounded-full bg-yeild-yellow/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-yeild-yellow h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Generate authentic social media content</h4>
                    <p className="text-gray-400">Leverage our network of users to create and share authentic content.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="yeild-btn-primary mt-10 group"
                onClick={() => navigate("/brand-signup")}
              >
                Partner With Us
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="lg:w-1/2 lg:pl-12">
              <Card className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 relative overflow-hidden backdrop-blur-sm border-2 border-gray-800/50">
                <CardContent className="p-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yeild-yellow/20 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <div className="mb-6 flex items-center">
                      <div className="p-2 bg-yeild-yellow/20 rounded-lg mr-3">
                        <Award className="text-yeild-yellow h-6 w-6" />
                      </div>
                      <span className="font-bold text-lg">Brand Success Story</span>
                    </div>
                    
                    <blockquote className="text-lg text-gray-300 mb-8 border-l-4 border-yeild-yellow/30 pl-4 italic">
                      "Within just 48 hours of launching our campaign on YEILD, we received over 500 detailed responses about our new product features. The quality of feedback was exceptional and directly influenced our development roadmap."
                    </blockquote>
                    
                    <div className="flex items-center mb-8">
                      <div className="w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-yeild-yellow/30">
                        <img 
                          src="https://i.pravatar.cc/150?img=12" 
                          alt="Marketing Director" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Jennifer Miller</div>
                        <div className="text-gray-400 text-sm">Marketing Director, TechStart Inc.</div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-800">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-yeild-yellow">94%</div>
                          <div className="text-gray-400 text-sm">Response Rate</div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-yeild-yellow">4.8/5</div>
                          <div className="text-gray-400 text-sm">Quality Score</div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-yeild-yellow">3.2x</div>
                          <div className="text-gray-400 text-sm">ROI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Enhanced with better cards */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-yeild-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-yeild-yellow/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-yeild-yellow/10 rounded-full text-yeild-yellow text-sm font-semibold mb-3">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
              What Our <span className="text-yeild-yellow">Community</span> Says
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yeild-yellow rounded-full"></div>
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto">Hear from our community of users who are earning rewards every day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 group hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 text-4xl text-yeild-yellow/20 font-serif">"</div>
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-yeild-yellow/30 group-hover:ring-yeild-yellow/70 transition-all duration-300">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-yeild-yellow text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-300 mb-4 relative z-10">
                    "{testimonial.testimonial}"
                  </blockquote>
                  
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yeild-yellow" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        {/* Enhanced Yellow accent graphics */}
        <div className="absolute -top-20 left-0 w-64 h-64 bg-yeild-yellow rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yeild-yellow/15 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-yeild-card border border-gray-800 hover:border-yeild-yellow/50 transition-all duration-500 border-2 border-gray-800/50 overflow-hidden">
            <CardContent className="p-10 text-center">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-yeild-yellow to-transparent"></div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to start <span className="text-yeild-yellow">YEILDing</span>?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users already earning rewards by completing simple tasks.
                Sign up for free and start earning today!
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  className="yeild-btn-primary text-lg group"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  className="yeild-btn-secondary text-lg"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-gray-950 py-12 border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-yeild-yellow text-2xl font-bold mb-4 relative inline-block">
                YEILD
                <div className="absolute -bottom-1 left-0 w-12 h-1 bg-yeild-yellow/50 rounded-full"></div>
              </div>
              <p className="text-gray-400 mb-4">
                The platform that rewards you for completing tasks you enjoy.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons with hover effects */}
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-yeild-yellow hover:bg-gray-800 transition-colors"
                  >
                    {social === 'facebook' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                      </svg>
                    )}
                    {social === 'twitter' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    )}
                    {social === 'instagram' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.045-1.064.218-1.504.344-1.857.182-.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h-.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick navigation links with hover effects */}
            {[
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Blog"]
              },
              {
                title: "Resources",
                links: ["Help Center", "Community", "Rewards Guide", "API Documentation"]
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Contact Us"]
              }
            ].map((column, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-1 h-5 bg-yeild-yellow mr-2 rounded-full"></span>
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-gray-400 hover:text-yeild-yellow transition-colors flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-1 bg-yeild-yellow mr-0 group-hover:mr-2 rounded-full transition-all duration-300"></span>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-900 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} YEILD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
