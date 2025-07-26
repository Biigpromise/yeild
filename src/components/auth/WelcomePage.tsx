
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface WelcomePageProps {
  onNext: () => void;
}

const WelcomePage = ({ onNext }: WelcomePageProps) => {
  const [logoAnimated, setLogoAnimated] = useState(false);

  useEffect(() => {
    // Trigger logo animation after component mounts
    const timer = setTimeout(() => {
      setLogoAnimated(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/20 blur-3xl animate-pulse-subtle"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/15 blur-3xl animate-float"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6 relative z-10">
        <div className="space-y-6">
          {/* Animated Logo */}
          <div className={`transition-all duration-1000 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100 scale-100' : 'transform -translate-y-20 opacity-0 scale-110'
          }`}>
            <div className="inline-block p-6 bg-primary/20 rounded-full border border-primary/30 shadow-2xl">
              <img 
                src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
                alt="YEILD Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>
          
          {/* Welcome Text - appears after logo animation */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Welcome <span className="text-primary drop-shadow-lg">YEILDER</span>
            </h1>
          </div>
        </div>
        
        {/* Button - appears last */}
        <div className={`transition-all duration-1000 delay-500 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <Button 
            onClick={onNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-6 rounded-full font-semibold shadow-yeild-button hover:shadow-xl transition-all duration-300"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
