
import { Link } from "react-router-dom";

const LoginFooter = () => {
  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-gray-400">
        Don't have an account?{" "}
        <Link to="/signup" className="text-yeild-yellow hover:underline">
          Sign up
        </Link>
      </p>
      
      <div className="text-xs text-gray-500 space-x-4">
        <Link to="/terms" className="hover:text-yeild-yellow transition-colors">
          Terms of Service
        </Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-yeild-yellow transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default LoginFooter;
