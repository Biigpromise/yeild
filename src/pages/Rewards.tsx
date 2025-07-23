
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Rewards: React.FC = () => {
  return (
    <div className="min-h-screen bg-yeild-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Rewards page content coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;
