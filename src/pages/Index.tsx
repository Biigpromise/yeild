
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle, Award, Star, ArrowRight } from "lucide-react";

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
      {/* Hero Section */}
      <header className="relative bg-yeild-black overflow-hidden">
        {/* Yellow accent graphics */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-yeild-yellow rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yeild-yellow rounded-full opacity-10 blur-3xl"></div>
        
        <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#how-it-works" className="text-white hover:text-yeild-yellow transition">How It Works</a>
            <a href="#for-brands" className="text-white hover:text-yeild-yellow transition">For Brands</a>
            <a href="#testimonials" className="text-white hover:text-yeild-yellow transition">Testimonials</a>
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

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Complete Tasks. <br /> 
                <span className="text-yeild-yellow">Earn Rewards.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8">
                Join thousands of YEILDers making money by completing simple tasks from your phone or computer.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="yeild-btn-primary text-lg"
                  onClick={() => navigate("/signup")}
                >
                  Start Earning Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="yeild-btn-secondary text-lg"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  Learn More
                </Button>
              </div>
              
              <div className="flex items-center mt-8 gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-yeild-black overflow-hidden">
                      <img 
                        src={`https://i.pravatar.cc/150?img=${i+10}`}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-gray-300">
                  <span className="text-yeild-yellow font-bold">5,000+</span> users this month
                </span>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-yeild-yellow/20 blur-xl rounded-full"></div>
                <div className="yeild-card relative">
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
                  <Button className="w-full yeild-btn-primary">
                    Accept Task
                  </Button>
                </div>
                
                <div className="absolute -right-4 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-lg">
                  <div className="text-yeild-yellow font-bold">$25.00</div>
                  <div className="text-xs text-gray-400">Earned Today</div>
                </div>
                
                <div className="absolute -left-4 bottom-0 transform -translate-x-1/2 translate-y-1/2 bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-lg">
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

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-gray-950 to-yeild-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            How <span className="text-yeild-yellow">YEILD</span> Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="yeild-card">
              <div className="w-12 h-12 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-yeild-yellow text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Sign Up</h3>
              <p className="text-gray-300">
                Create your free account in less than a minute. No credit card required.
              </p>
            </div>
            
            <div className="yeild-card">
              <div className="w-12 h-12 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-yeild-yellow text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Tasks</h3>
              <p className="text-gray-300">
                Choose from hundreds of available tasks that match your skills and interests.
              </p>
            </div>
            
            <div className="yeild-card">
              <div className="w-12 h-12 bg-yeild-yellow/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-yeild-yellow text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Get Paid</h3>
              <p className="text-gray-300">
                Earn points for every completed task and convert them to cash or gift cards.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Available Task Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {taskExamples.map((task, index) => (
                <div key={index} className="yeild-card">
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
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              className="yeild-btn-primary text-lg"
              onClick={() => navigate("/signup")}
            >
              Join YEILD Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section id="for-brands" className="py-16 md:py-24 relative overflow-hidden">
        {/* Yellow accent graphics */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yeild-yellow rounded-full opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <span className="text-yeild-yellow font-semibold mb-2 block">FOR BRANDS</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Connect with engaged users ready to interact with your brand
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Partner with YEILD to create custom tasks that drive meaningful engagement with your target audience. Our platform helps you:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="text-yeild-yellow mr-3 h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Gather valuable user feedback</h4>
                    <p className="text-gray-400">Get real insights from real users to improve your products.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="text-yeild-yellow mr-3 h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Boost app installations and reviews</h4>
                    <p className="text-gray-400">Increase your app's visibility and credibility through organic growth.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="text-yeild-yellow mr-3 h-6 w-6 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Generate authentic social media content</h4>
                    <p className="text-gray-400">Leverage our network of users to create and share authentic content.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="yeild-btn-primary mt-8"
                onClick={() => navigate("/brand-signup")}
              >
                Partner With Us
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="lg:w-1/2 lg:pl-12">
              <div className="yeild-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yeild-yellow/30 rounded-full blur-xl"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center">
                    <Award className="text-yeild-yellow mr-2 h-6 w-6" />
                    <span className="font-bold text-lg">Brand Success Story</span>
                  </div>
                  
                  <blockquote className="text-lg text-gray-300 mb-6">
                    "Within just 48 hours of launching our campaign on YEILD, we received over 500 detailed responses about our new product features. The quality of feedback was exceptional and directly influenced our development roadmap."
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img 
                        src="https://i.pravatar.cc/150?img=12" 
                        alt="Marketing Director" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold">Jennifer Miller</div>
                      <div className="text-gray-400 text-sm">Marketing Director, TechStart Inc.</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex justify-between text-center">
                      <div>
                        <div className="text-2xl font-bold text-yeild-yellow">94%</div>
                        <div className="text-gray-400 text-sm">Response Rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yeild-yellow">4.8/5</div>
                        <div className="text-gray-400 text-sm">Quality Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yeild-yellow">3.2x</div>
                        <div className="text-gray-400 text-sm">ROI</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            What Our <span className="text-yeild-yellow">Community</span> Says
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="yeild-card">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                
                <blockquote className="text-gray-300">
                  "{testimonial.testimonial}"
                </blockquote>
                
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yeild-yellow" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        {/* Yellow accent graphics */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yeild-yellow rounded-full opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start <span className="text-yeild-yellow">YEILDing</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of users already earning rewards by completing simple tasks.
              Sign up for free and start earning today!
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="yeild-btn-primary text-lg"
                onClick={() => navigate("/signup")}
              >
                Sign Up Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="yeild-btn-secondary text-lg"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-yeild-yellow text-2xl font-bold mb-4">YEILD</div>
              <p className="text-gray-400 mb-4">
                The platform that rewards you for completing tasks you enjoy.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons */}
                <a href="#" className="text-gray-400 hover:text-yeild-yellow transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yeild-yellow transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yeild-yellow transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Rewards Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-yeild-yellow transition">Contact Us</a></li>
              </ul>
            </div>
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
