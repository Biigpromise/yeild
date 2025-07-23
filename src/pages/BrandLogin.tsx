
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BrandLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Brand Login</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Brand login feature coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandLogin;
