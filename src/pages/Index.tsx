
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
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
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleLoginClick}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Login
              </Button>
              <Button 
                className="bg-white text-black hover:bg-gray-200" 
                onClick={handleGetStarted}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-yeild-yellow">
            Earn Rewards
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users making money by completing simple tasks from your phone or computer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-6 w-full sm:w-auto"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {!user && (
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6 w-full sm:w-auto"
                onClick={handleLoginClick}
              >
                Login
              </Button>
            )}
          </div>

          {/* Star Icon Section */}
          <div className="mx-auto w-32 h-32 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700">
            <div className="text-yeild-yellow text-6xl">✦</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-yeild-yellow">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                  <span className="text-black font-bold text-xl">1</span>
                </div>
                <CardTitle className="text-white text-2xl">Sign Up</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Create your account in less than 2 minutes and set your preferences.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                  <span className="text-black font-bold text-xl">2</span>
                </div>
                <CardTitle className="text-white text-2xl">Complete Tasks</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Choose from available tasks that match your interests and skills.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 bg-yeild-yellow rounded-full flex items-center justify-center mb-4">
                  <span className="text-black font-bold text-xl">3</span>
                </div>
                <CardTitle className="text-white text-2xl">Earn Rewards</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Get paid directly to your account after task verification.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* For Brands Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-yeild-yellow">For Brands</h2>
          </div>
          
          <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Reach Your Audience</CardTitle>
                <CardDescription className="text-gray-300 text-lg mb-6">
                  Connect with targeted users who are interested in your products and services.
                </CardDescription>
                <Button 
                  asChild
                  className="bg-white text-black hover:bg-gray-200 w-fit"
                >
                  <Link to="/brand-signup">
                    Partner With Us
                  </Link>
                </Button>
              </CardHeader>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Measurable Results</CardTitle>
                <CardDescription className="text-gray-300 text-lg mb-6">
                  Track campaign performance and user engagement with our analytics dashboard.
                </CardDescription>
                <Button 
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 w-fit"
                >
                  View Case Studies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
            </Card>
          </div>
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
