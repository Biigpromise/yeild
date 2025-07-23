
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-8">
      <div className="bg-card rounded-lg p-6 border border-border hover:border-muted-foreground/50 transition-colors">
        <Target className="h-12 w-12 mx-auto mb-4 text-yeild-yellow" />
        <h2 className="text-xl font-bold text-foreground mb-2">Ready to earn?</h2>
        <p className="text-muted-foreground mb-4">Browse and complete tasks to earn points!</p>
        <Button 
          onClick={() => navigate('/tasks')}
          className="bg-yeild-yellow hover:bg-yeild-yellow/90 text-black font-medium px-6 py-2"
        >
          Browse Tasks
        </Button>
      </div>
    </div>
  );
};
