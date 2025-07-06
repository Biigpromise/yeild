
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
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative overflow-hidden">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6">
        <div className="space-y-6">
          {/* Animated Logo */}
          <div className={`transition-all duration-1000 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100 scale-100' : 'transform -translate-y-20 opacity-0 scale-110'
          }`}>
            <div className="inline-block p-4 bg-yeild-yellow/10 rounded-full">
              <img 
                src="/lovable-uploads/cb163ee5-dbef-4122-b312-dacff15aa072.png" 
                alt="YEILD Logo" 
                className="w-20 h-20 md:w-24 md:h-24 object-contain"
              />
            </div>
          </div>
          
          {/* Welcome Text - appears after logo animation */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
          }`}>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Welcome <span className="text-yeild-yellow">YEILDER</span>
            </h1>
          </div>
        </div>
        
        {/* Button - appears last */}
        <div className={`transition-all duration-1000 delay-500 ease-out ${
          logoAnimated ? 'transform translate-y-0 opacity-100' : 'transform translate-y-10 opacity-0'
        }`}>
          <Button 
            onClick={onNext}
            className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 text-lg px-12 py-6 rounded-full font-semibold"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
