
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import LoginFooter from "@/components/auth/LoginFooter";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle redirect after auth state is determined
  useEffect(() => {
    console.log("Auth state changed - loading:", loading, "user:", user?.email);
    if (!loading && user) {
      console.log("User authenticated, redirecting to dashboard");
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
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="w-full max-w-md p-6">
        <LoginHeader onBackClick={() => navigate("/")} />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
};

export default Login;
