
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

// This component is deprecated - redirecting to the new consolidated brand signup
const BrandSignupForm = () => {
  const navigate = useNavigate();

  // Redirect to the new brand signup flow
  React.useEffect(() => {
    toast.info("Redirecting to improved brand signup...");
    navigate('/auth?type=brand', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
        <p className="text-gray-400 mt-2">Redirecting to brand signup...</p>
        
        <div className="mt-6">
          <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandSignupForm;
