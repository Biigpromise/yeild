
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/54ccebd1-9d4c-452f-b0a9-0b9de0fcfebf.png" 
              alt="YEILD Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-yeild-yellow">YEILD Dashboard</h1>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-yeild-yellow flex items-center gap-2">
              <User className="w-5 h-5" />
              Welcome back!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-2">
              Email: <span className="text-white">{user?.email}</span>
            </p>
            <p className="text-gray-300">
              You're logged in as a creator. Start completing tasks to earn rewards!
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Task management functionality coming soon...
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Rewards system coming soon...
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Profile management coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
