
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Simulate a logged-in user (replace with actual auth check)
  const isLoggedIn = localStorage.getItem("yeild-user") !== null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Simplified Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-yeild-yellow text-3xl font-bold tracking-tight animate-pulse-subtle">YEILD</span>
        </div>
        <div className="hidden md:flex space-x-6">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#for-brands" className="nav-link">For Brands</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
        </div>
        <div className="flex space-x-4">
          {isLoggedIn ? (
            <Button 
              className="action-button-primary group"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
              <Star className="ml-2 h-5 w-5 text-white group-hover:text-yellow-300 transition-colors" />
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="action-button-secondary group"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button 
                className="action-button-primary group"
                onClick={() => navigate("/signup")}
              >
                Sign Up
                <Sparkles className="ml-2 h-5 w-5 text-white group-hover:text-yellow-300 transition-colors" />
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <h1 className="text-5xl font-bold leading-tight yellow-gradient-text animate-float">Earn Rewards</h1>
            <p className="text-xl text-white/80">
              Join thousands of users making money by completing simple tasks from your phone or computer.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="action-button-primary group"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="action-button-secondary"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </div>
          <div className="shiny-card flex items-center justify-center p-12">
            <div className="text-6xl animate-float flex items-center justify-center">
              <Sparkles className="h-24 w-24 text-yeild-yellow" />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center yellow-text">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card hover-lift">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yeild-yellow to-yeild-yellow-dark text-black flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-2xl font-bold mb-2">Sign Up</h3>
              <p className="text-white/70">Create your account in less than 2 minutes and set your preferences.</p>
            </div>
            <div className="feature-card hover-lift">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yeild-yellow to-yeild-yellow-dark text-black flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-2xl font-bold mb-2">Complete Tasks</h3>
              <p className="text-white/70">Choose from available tasks that match your interests and skills.</p>
            </div>
            <div className="feature-card hover-lift">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yeild-yellow to-yeild-yellow-dark text-black flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-2xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-white/70">Get paid directly to your account after task verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section id="for-brands" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center yellow-text">For Brands</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="feature-card hover-scale">
              <h3 className="text-2xl font-bold mb-4">Reach Your Audience</h3>
              <p className="text-white/70 mb-6">Connect with targeted users who are interested in your products and services.</p>
              <Button 
                className="action-button-primary group"
                onClick={() => navigate("/brand-signup")}
              >
                Partner With Us
                <Star className="ml-2 h-5 w-5 text-white group-hover:text-yellow-300 transition-colors" />
              </Button>
            </div>
            <div className="feature-card hover-scale">
              <h3 className="text-2xl font-bold mb-4">Measurable Results</h3>
              <p className="text-white/70 mb-6">Track campaign performance and user engagement with our analytics dashboard.</p>
              <Button 
                variant="outline" 
                className="action-button-secondary group"
                onClick={() => window.open('#', '_blank')}
              >
                View Case Studies
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center yellow-text">Testimonials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="testimonial-card hover-lift">
              <p className="italic mb-4 text-white/70">"I've earned over $500 in my first month using this platform. The tasks are easy and payment is always on time."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yeild-yellow/40 to-yeild-yellow-dark/40"></div>
                <div className="ml-4">
                  <p className="font-bold">Sarah K.</p>
                  <p className="text-sm text-white/50">Student</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card hover-lift">
              <p className="italic mb-4 text-white/70">"As a brand, we've seen remarkable engagement from users. Our campaign metrics exceeded expectations."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yeild-yellow/40 to-yeild-yellow-dark/40"></div>
                <div className="ml-4">
                  <p className="font-bold">Mark J.</p>
                  <p className="text-sm text-white/50">Marketing Director</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card hover-lift">
              <p className="italic mb-4 text-white/70">"The platform is so intuitive. I complete tasks during my commute and have earned enough for a vacation!"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yeild-yellow/40 to-yeild-yellow-dark/40"></div>
                <div className="ml-4">
                  <p className="font-bold">James T.</p>
                  <p className="text-sm text-white/50">Professional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black py-8 border-t border-white/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 yellow-text">YEILD</h3>
              <p className="text-white/70">Making task completion rewarding.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Links</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
                <li><a href="#for-brands" className="footer-link">For Brands</a></li>
                <li><a href="#testimonials" className="footer-link">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-white/70">support@yeild.com</p>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-white/70">&copy; {new Date().getFullYear()} YEILD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
