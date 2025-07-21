
import { Button } from "@/components/ui/button";
import { User, Building } from "lucide-react";

interface UserTypeSelectionProps {
  onSelectUser: () => void;
  onSelectBrand: () => void;
  onSwitchToSignin: () => void;
}

const UserTypeSelection = ({ onSelectUser, onSelectBrand, onSwitchToSignin }: UserTypeSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6 max-w-md w-full">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Welcome to <span className="text-yeild-yellow">YEILD</span>
          </h2>
          <p className="text-gray-300">Sign up as a Creator or Brand Partner</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={onSelectUser}
            className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-lg border border-gray-600"
            variant="outline"
          >
            <User className="mr-3 h-6 w-6" />
            Continue as User
          </Button>
          
          <Button 
            onClick={onSelectBrand}
            className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-lg border border-gray-600"
            variant="outline"
          >
            <Building className="mr-3 h-6 w-6 text-yeild-yellow" />
            Continue as <span className="text-yeild-yellow ml-1">Brand</span>
          </Button>
          
          <div className="text-center pt-4">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button onClick={onSwitchToSignin} className="text-yeild-yellow font-medium hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
