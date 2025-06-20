
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthFlow from "@/components/auth/AuthFlow";
import { ForBrands } from "@/components/landing/ForBrands";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedTasks } from "@/components/landing/FeaturedTasks";
import { Testimonials } from "@/components/landing/Testimonials";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuthFlow, setShowAuthFlow] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yeild-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If user is not logged in and hasn't seen the auth flow, show it
  if (!user && !showAuthFlow) {
    return <AuthFlow />;
  }

  // Show the original landing page if user chooses to go back or for existing users
  return (
    <div className="min-h-screen bg-yeild-black text-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <FeaturedTasks />
        <Testimonials />
        <ForBrands />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
