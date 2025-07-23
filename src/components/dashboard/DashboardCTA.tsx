
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <Target className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
        <h2 className="text-xl font-bold text-white mb-2">Ready to earn?</h2>
        <p className="text-gray-400 mb-4">Browse and complete tasks to earn points!</p>
        <Button 
          onClick={() => navigate('/tasks')}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-2"
        >
          Browse Tasks
        </Button>
      </div>
    </div>
  );
};
