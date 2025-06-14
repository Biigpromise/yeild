
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Trophy, Users, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminAccessBanner } from "@/components/AdminAccessBanner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showAdminBanner, setShowAdminBanner] = useState(false);

  useEffect(() => {
    // Show admin banner for logged in users
    if (!loading && user) {
      setShowAdminBanner(true);
    }
  }, [user, loading]);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-yeild-black text-white">
      {/* Admin Access Banner */}
      {showAdminBanner && (
        <div className="bg-yeild-black border-b border-gray-800 p-4">
          <AdminAccessBanner />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-yeild-yellow text-2xl font-bold">YEILD</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/admin-setup")}>
                <Shield className="h-4 w-4 mr-2" />
                Admin Setup
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLoginClick}>
                Log In
              </Button>
              <Button className="yeild-btn-primary" onClick={handleGetStarted}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Background graphics */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <Badge variant="secondary" className="mb-6 bg-yeild-yellow/20 text-yeild-yellow border-yeild-yellow/30">
            🚀 Transform Your Social Media Into Income
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Your
            <span className="text-yeild-yellow"> Social Influence</span>
            <br />
            Into Real Money
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators earning daily rewards through simple social media tasks. 
            No followers required - just authentic engagement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="yeild-btn-primary text-lg px-8 py-6 w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              Start Earning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {!user && (
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6 w-full sm:w-auto"
                onClick={handleLoginClick}
              >
                I Have an Account
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-yeild-yellow mb-2">$50K+</div>
              <div className="text-gray-400">Paid to Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yeild-yellow mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yeild-yellow mb-2">24hrs</div>
              <div className="text-gray-400">Average Payout Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How YEILD Works</h2>
            <p className="text-xl text-gray-300">Three simple steps to start earning</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-yeild-yellow" />
                </div>
                <CardTitle className="text-white">1. Sign Up</CardTitle>
                <CardDescription className="text-gray-300">
                  Create your free account and connect your social media profiles
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-yeild-yellow" />
                </div>
                <CardTitle className="text-white">2. Complete Tasks</CardTitle>
                <CardDescription className="text-gray-300">
                  Choose from hundreds of available social media tasks from top brands
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow/20 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-yeild-yellow" />
                </div>
                <CardTitle className="text-white">3. Get Paid</CardTitle>
                <CardDescription className="text-gray-300">
                  Earn points instantly and cash out to your preferred payment method
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose YEILD?</h2>
            <p className="text-xl text-gray-300">The most trusted platform for social media monetization</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <Star className="h-8 w-8 text-yeild-yellow mb-4" />
                <CardTitle className="text-white">Instant Payments</CardTitle>
                <CardDescription className="text-gray-300">
                  Get paid within 24 hours through multiple payment methods
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-yeild-yellow mb-4" />
                <CardTitle className="text-white">Verified Tasks</CardTitle>
                <CardDescription className="text-gray-300">
                  All tasks are verified and come from legitimate brand partners
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <Users className="h-8 w-8 text-yeild-yellow mb-4" />
                <CardTitle className="text-white">Growing Community</CardTitle>
                <CardDescription className="text-gray-300">
                  Join thousands of creators already earning with YEILD
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yeild-yellow/10 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the YEILD community today and transform your social media presence into a revenue stream.
          </p>
          <Button 
            size="lg" 
            className="yeild-btn-primary text-lg px-8 py-6"
            onClick={handleGetStarted}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-yeild-yellow text-xl font-bold">YEILD</span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming social media into sustainable income for creators worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/tasks" className="hover:text-white">Browse Tasks</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/brand-signup" className="hover:text-white">For Brands</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 YEILD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
