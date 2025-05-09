
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SuccessMessage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-yeild-yellow/20 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-yeild-yellow" />
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
      <p className="text-gray-300 text-xl mb-8">
        Thank you for your interest in partnering with YEILD
      </p>
      <p className="text-gray-400 mb-8">
        Our team will review your application and get back to you within 2-3 business days. 
        In the meantime, feel free to explore our platform.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          className="yeild-btn-primary" 
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
        <Button 
          variant="outline" 
          className="yeild-btn-secondary"
          onClick={() => window.open("https://calendly.com", "_blank")}
        >
          Schedule Demo Call
        </Button>
      </div>
    </div>
  );
};

export default SuccessMessage;
