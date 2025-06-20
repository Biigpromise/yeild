
import { Button } from "@/components/ui/button";
import { User, Building } from "lucide-react";

interface UserTypeSelectionProps {
  onSelectUser: () => void;
  onSelectBrand: () => void;
}

const UserTypeSelection = ({ onSelectUser, onSelectBrand }: UserTypeSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yeild-black relative">
      {/* Yellow accent graphics */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-yeild-yellow opacity-10 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-yeild-yellow opacity-10 blur-3xl"></div>
      
      <div className="text-center space-y-8 p-6 max-w-md w-full">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Sign in as a <span className="text-yeild-yellow">Brand</span> or <span className="text-yeild-yellow">User</span>?
          </h2>
          <p className="text-gray-300">Choose your account type to continue</p>
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
            <Building className="mr-3 h-6 w-6" />
            Continue as Brand
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
