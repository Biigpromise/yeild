
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginHeaderProps {
  onBackClick: () => void;
}

const LoginHeader = ({ onBackClick }: LoginHeaderProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-400 hover:text-white" 
        onClick={onBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <span className="text-yeild-yellow text-3xl font-bold">YEILD</span>
        </div>
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-gray-400 mt-2">Login to your YEILD account</p>
      </div>
    </>
  );
};

export default LoginHeader;
