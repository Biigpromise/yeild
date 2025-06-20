
import { Button } from "@/components/ui/button";

interface WelcomePageProps {
  onNext: () => void;
}

const WelcomePage = ({ onNext }: WelcomePageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6">
        <div className="space-y-6">
          <div className="inline-block p-4 bg-yeild-yellow/10 rounded-full">
            <span className="text-yeild-yellow text-5xl font-bold">YEILD</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Welcome <span className="text-yeild-yellow">YEILDER</span>
          </h1>
        </div>
        
        <Button 
          onClick={onNext}
          className="bg-yeild-yellow text-black hover:bg-yeild-yellow/90 text-lg px-12 py-6 rounded-full font-semibold"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default WelcomePage;
