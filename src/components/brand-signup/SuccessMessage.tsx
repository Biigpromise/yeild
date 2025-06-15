
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PartyPopper } from "lucide-react";

const SuccessMessage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center flex flex-col items-center justify-center h-full py-12">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-yeild-yellow/20 rounded-full flex items-center justify-center animate-pulse-subtle">
          <PartyPopper className="h-12 w-12 text-yeild-yellow" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
      <p className="text-gray-300 text-lg mb-6 max-w-md">
        Thank you for your interest in partnering with YEILD. We're excited to have you on board.
      </p>
      <p className="text-gray-400 mb-8 max-w-md">
        Our team will review your application and get back to you within 2-3 business days. 
        In the meantime, feel free to explore our platform.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-sm">
        <Button 
          className="yeild-btn-primary w-full" 
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
        <Button 
          variant="outline" 
          className="yeild-btn-secondary w-full"
          onClick={() => window.open("https://calendly.com", "_blank")}
        >
          Schedule Demo Call
        </Button>
      </div>
    </div>
  );
};

export default SuccessMessage;
