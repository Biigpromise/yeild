
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LoginFooter = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 space-y-4">
      <div className="text-center">
        <p className="text-gray-400">
          Don't have an account?{" "}
          <Link to="/auth" className="text-yeild-yellow hover:underline">
            Sign up
          </Link>
        </p>
        
        <div className="text-xs text-gray-500 space-x-4 mt-2">
          <Link to="/terms" className="hover:text-yeild-yellow transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-yeild-yellow transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Create New Account Button at Bottom */}
      <div className="pt-4 border-t border-gray-700">
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="w-full border-yeild-yellow text-yeild-yellow hover:bg-yeild-yellow/10 py-3 text-base font-semibold rounded-lg"
        >
          Create new account
        </Button>
      </div>
    </div>
  );
};

export default LoginFooter;
