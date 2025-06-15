
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SignUpHeader from "@/components/auth/SignUpHeader";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle redirect after auth state is determined
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

  // Don't render the form if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md p-6">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <SignUpHeader />
        
        <SignUpForm />
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-yeild-yellow hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
