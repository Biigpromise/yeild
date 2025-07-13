
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowLeft } from 'lucide-react';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header with back button */}
      <div className="p-6">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="text-white hover:bg-gray-800 p-2 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md w-full space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img 
              src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
              alt="YEILD Logo" 
              className="w-16 h-16 mx-auto mb-6 object-contain"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-4">
              Join as a <span className="text-yeild-yellow">User</span> or <span className="text-yeild-yellow">Brand</span>?
            </h1>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-4"
          >
            <Button
              onClick={() => navigate('/auth?type=user')}
              className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-lg border border-gray-600 rounded-lg flex items-center justify-center gap-3"
              variant="outline"
            >
              <Users className="w-6 h-6" />
              Continue as User
            </Button>
            
            <Button
              onClick={() => navigate('/auth?type=brand')}
              className="w-full bg-gray-800 text-white hover:bg-gray-700 py-6 text-lg border border-gray-600 rounded-lg flex items-center justify-center gap-3"
              variant="outline"
            >
              <Building2 className="w-6 h-6" />
              Continue as Brand
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
