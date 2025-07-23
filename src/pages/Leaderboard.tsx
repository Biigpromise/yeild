
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Leaderboard as LeaderboardComponent } from '@/components/Leaderboard';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-gray-400">See who's leading the rankings</p>
          </div>
        </div>
        
        {/* Leaderboard Component */}
        <LeaderboardComponent />
      </div>
    </div>
  );
};

export default Leaderboard;
